var mongoose = require('mongoose');
var Menu     = require('./Menu');
var ai       = require('../util/ai');

var businessSchema = mongoose.Schema({
  name: String,
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

module.exports = mongoose.model('Business', businessSchema);

module.exports.refreshMenuEntities = async function(business) {
  var menu = await Menu.find({businessId: business._id.toString()}).exec();
  var userEntity = {
    sessionId: business._id.toString(),
    name: "food",
    extend: false,
    entries: menu.map(function(menuItem) {
      return {
        value: menuItem.name,
        synonyms: [menuItem.name]
      }
    })
  };
  return await ai.createUserEntity(userEntity);
};