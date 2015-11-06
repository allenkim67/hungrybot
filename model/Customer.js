var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var customerSchema = mongoose.Schema({
  phone: String,
  creditcard: String
});

customerSchema.plugin(findOrCreate);

module.exports = mongoose.model('Customer', customerSchema);