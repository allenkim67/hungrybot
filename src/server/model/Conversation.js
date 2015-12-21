var mongoose = require('mongoose');
var findOrCreate = require('../util/findOrCreatePlugin');
var timestamps   = require('mongoose-timestamp');

var conversationSchema = mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  conversationData: [{
    customerInput: String, 
    botOutput: String,
    orderInput: String,
    orderOutput: String,
    nlpData: {intent: String, entities: String}
  }],
  status: {type: String, default: 'recording'}  
});

conversationSchema.plugin(findOrCreate);
conversationSchema.plugin(timestamps);

conversationSchema.statics.recordChat = async function(input, output) {

  var conversation = await this.findOrCreate({customerId: input.convoState.customer._id, businessId: input.business._id, status: {$ne: 'end'}}, {customerId: input.convoState.customer._id, businessId: input.business._id});
  console.log(output.convoState.customer.order);

  if(output.convoState.order) {
    if(output.convoState.order.status === 'paid') {
      return conversation.status = 'end';
    }
  }

    await conversation.conversationData.push({
      customerInput: input.nlpData.message,
      botOutput: output.message,
      orderInput: input.convoState.order, 
      orderOutput: output.convoState.order, 
      nlpData: {intent: output.nlpData.intent, entities: output.nlpData.entities}
    });

  return await conversation.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);