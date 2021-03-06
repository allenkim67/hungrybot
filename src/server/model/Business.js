var mongoose     = require('mongoose');
var findOrCreate = require('../util/findOrCreatePlugin');

var businessSchema = mongoose.Schema({
  email: String,
  password: String,
  stripeAccount: String,
  botPhone: String,
  appFee: {type: Number, default: 0.135},
  first: String,
  last: String,
  name: String,
  address: {
    street: String,
    suite: String,
    city: String,
    state: String,
    zipCode: Number
  },
  deliveryRadius: Number,
  contactPhone: String,
  minimumOrder: Number,
  site: String,
  hours: {
    mon: {start: String, end: String, working: Boolean},
    tue: {start: String, end: String, working: Boolean},
    wed: {start: String, end: String, working: Boolean},
    thu: {start: String, end: String, working: Boolean},
    fri: {start: String, end: String, working: Boolean},
    sat: {start: String, end: String, working: Boolean},
    sun: {start: String, end: String, working: Boolean}
  },
  menuImages: [String]
});

businessSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

businessSchema.plugin(findOrCreate);

module.exports = mongoose.model('Business', businessSchema);