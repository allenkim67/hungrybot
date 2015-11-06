var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  stripeAccount: String,
  phone: String
});

// userSchema.set('toJSON', {
//   transform: function(doc, ret) {
//     delete.ret.password;
//     return ret;
//   }
// });

module.exports = mongoose.model('User', userSchema);