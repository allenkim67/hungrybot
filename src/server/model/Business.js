var mongoose     = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var businessSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  stripeAccount: String,
  botPhone: String,
  appFee: {type: Number, default: 0.135},
  address: {
    street1: String,
    street2: String,
    city: String,
    state: String,
    zipCode: Number
  },
  contactPhone: String,
  site: String,
  hours: {
    mon: {start: String, end: String},
    tues: {start: String, end: String},
    wed: {start: String, end: String},
    thurs: {start: String, end: String},
    fri: {start: String, end: String},
    sat: {start: String, end: String},
    sun: {start: String, end: String}
  }
});

businessSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

businessSchema.plugin(findOrCreate);

module.exports = mongoose.model('Business', businessSchema);