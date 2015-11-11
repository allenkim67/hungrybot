var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
  phone: String,
  stripeId: String,
  address: {
    street: String,
    city: String,
    state: String
  }
});

customerSchema.statics.createByPhoneIfNotExist = function(phone, callback) {
  this.update({phone: phone}, {$setOnInsert: {phone: phone}}, {upsert: true}, callback);
};

module.exports = mongoose.model('Customer', customerSchema);