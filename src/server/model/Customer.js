var mongoose = require('mongoose');

var defaultConvoState = {status: 'start', withInfo: false};

var customerSchema = mongoose.Schema({
  phone: String,
  stripeId: String,
  address: {
    street: String,
    city: String,
    state: String
  },
  cc: Number,
  convoState: {
    type: {status: String, withInfo: Boolean},
    default: defaultConvoState
  }
});

customerSchema.statics.defaultState = defaultConvoState;

customerSchema.statics.createByPhoneIfNotExist = function(phone) {
  return this.update({phone: phone}, {$setOnInsert: {phone: phone}}, {upsert: true});
};

module.exports = mongoose.model('Customer', customerSchema);