var mongoose = require('mongoose');

var subscriberSchema = mongoose.Schema({
  subscriberName: String,
  subscriberEmail: String
});

module.exports = mongoose.model('Subscriber', subscriberSchema);