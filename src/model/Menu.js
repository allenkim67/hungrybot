var mongoose = require('mongoose');

var menuSchema = mongoose.Schema({
  name: String,
  description: String,
  price: Number
});

module.exports = mongoose.model('Menu', menuSchema);