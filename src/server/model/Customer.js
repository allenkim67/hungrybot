var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
  phone: String,
  email: String,
  stripeId: String,
  address: {
    type: {
      street1: String,
      city: String,
      state: String,
      zip: String
    },
    default: null
  },
  cc: Number
});

customerSchema.statics.createByPhoneIfNotExist = function(phone) {
  return this.update({phone: phone}, {$setOnInsert: {phone: phone}}, {upsert: true});
};

module.exports = mongoose.model('Customer', customerSchema);