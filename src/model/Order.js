var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  phonenumber: Number,
  item: String,
  quantity: Number,
  notes: String
});

module.exports = mongoose.model('Order', orderSchema);