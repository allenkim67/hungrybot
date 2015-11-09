var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  stripeAccount: String,
  phone: String,
  appFee: {type: Number, default: 0.135}
});

// userSchema.set('toJSON', {
//   transform: function(doc, ret) {
//     delete.ret.password;
//     return ret;
//   }
// });

module.exports = mongoose.model('User', userSchema);