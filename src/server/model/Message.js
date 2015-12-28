var mongoose = require('mongoose');
var findOrCreate = require('../util/findOrCreatePlugin');
var timestamps   = require('mongoose-timestamp');

var messageSchema = mongoose.Schema({
  orderId: String,
  messageOutput: String,
  messageInput: String,
  nlpData: {intent: String, entities: String}
});

messageSchema.plugin(findOrCreate);
messageSchema.plugin(timestamps);

messageSchema.statics.recordMessage = async function(input, output) {
  var order = await input.convoState.order ? input.convoState.order._id : 'noId';

  var message = await this.create({
    orderId: order,
    messageOutput: output.message,
    messageInput: input.nlpData.message,
    nlpData: {intent: output.nlpData.intent, entities: output.nlpData.entities}
  });

  return await message.save();
};

module.exports = mongoose.model('Message', messageSchema);