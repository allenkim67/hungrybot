var mongoose = require('mongoose');
var findOrCreate = require('../util/findOrCreatePlugin');
var timestamps   = require('mongoose-timestamp');

var messageSchema = mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  messageBot: String,
  message: String,
  nlpData: {intent: String, entities: String}
});

messageSchema.plugin(findOrCreate);
messageSchema.plugin(timestamps);

messageSchema.statics.recordMessage = async function(input, output) {
  var message = await this.create({
    orderId: input.convoState.order._id,
    messageBot: output.message,
    message: input.nlpData.message,
    nlpData: {intent: output.nlpData.intent, entities: output.nlpData.entities}
  });

  return await message.save();
};

module.exports = mongoose.model('Message', messageSchema);