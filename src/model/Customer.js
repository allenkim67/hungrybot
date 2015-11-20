var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
  phone: String,
  stripeId: String,
  address: {
    street: String,
    city: String,
    state: String
  },
  cc: Number
});

customerSchema.statics.createByPhoneIfNotExist = function(phone) {
  return this.update({phone: phone}, {$setOnInsert: {phone: phone}}, {upsert: true});
};

module.exports = mongoose.model('Customer', customerSchema);