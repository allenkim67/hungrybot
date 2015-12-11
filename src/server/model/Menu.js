var mongoose     = require('mongoose');

var menuSchema = mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  name: String,
  synonyms: [String],
  description: String,
  price: Number
});

module.exports = mongoose.model('Menu', menuSchema);