var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var customerSchema = mongoose.Schema({
  phone: String,
  stripeId: String,
  address: {
    street: String,
    city: String,
    state: String
  }
});

customerSchema.plugin(findOrCreate);

module.exports = mongoose.model('Customer', customerSchema);