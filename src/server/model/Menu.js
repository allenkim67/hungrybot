var mongoose     = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var menuSchema = mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number
});

menuSchema.plugin(findOrCreate);

module.exports = mongoose.model('Menu', menuSchema);