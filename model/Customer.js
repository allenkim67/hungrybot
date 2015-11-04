var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
  phonenumber: String,
  creditcard: String
});

module.exports = mongoose.model('Customer', customerSchema);