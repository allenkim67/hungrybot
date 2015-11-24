var mongoose = require('mongoose');

var subscriberSchema = mongoose.Schema({
  name: String,
  email: String
});

module.exports = mongoose.model('Subscriber', subscriberSchema);