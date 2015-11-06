var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var customerSchema = mongoose.Schema({
  phone: String,
  creditcard: String,
  address: {
    street: String,
    city: String,
    state: String
  }
});

customerSchema.plugin(findOrCreate);

customerSchema.methods.updateAddressWithAiParams = function(params) {
  this.address = {
    street: params.address,
    state: params['geo-state-us'],
    city: params['geo-city-us']
  };
  this.save();
};

module.exports = mongoose.model('Customer', customerSchema);