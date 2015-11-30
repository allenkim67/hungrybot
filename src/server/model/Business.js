var mongoose     = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var businessSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  stripeAccount: String,
  phone: String,
  appFee: {type: Number, default: 0.135}
});

businessSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

businessSchema.plugin(findOrCreate);

module.exports = mongoose.model('Business', businessSchema);