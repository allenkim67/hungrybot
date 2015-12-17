require("babel-polyfill");
require('babel-core/register');

var mongoose = require('mongoose');
var Business = require('./src/server/model/Business');
var Menu     = require("./src/server/model/Menu");
var nlp      = require('./src/server/util/nlp');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/hungrybot');

mongoose.connection.on('open', function () {
  var businessData = {
    first: "allen",
    last: "kim",
    password: "$2a$08$66ZA3aMsj49drL5u6FJweuE0WX351gze/U0pAXQC.nAwwGNpy8Bfq",
    email: 'hungryDemoBusiness@hungrybot.io',
    name: 'Krusty Krab'
  };
  Business.update({email: 'hungryDemoBusiness@hungrybot.io'}, businessData, {upsert: true}).then(function() {
    Business.findOne({email: 'hungryDemoBusiness@hungrybot.io'}).exec().then(function(business) {
      var menu1 = {
        businessId: business._id,
        name: 'Krabby Patty',
        synonyms: ['classic', 'patty', 'krabby'],
        description: 'The classic!',
        price: 200
      };
      var menu2 = {
        businessId: business._id,
        name: 'Krusty Combo',
        synonyms: ['combo'],
        description: 'Now you can have it all',
        price: 399
      };
      var menu3 = {
        businessId: business._id,
        name: 'Krusty Deluxe',
        synonyms: ['deluxe'],
        description: 'Pure decadence',
        price: 300
      };
      var menu4 = {
        businessId: business._id,
        name: 'Seaweed Salad',
        synonyms: ['salad', 'seaweed'],
        description: 'For the health conscious sea-dweller',
        price: 200
      };
      var menu5 = {
        businessId: business._id,
        name: 'Coral Bits',
        synonyms: ['coral', 'bits'],
        description: 'A delicious side dish',
        price: 200
      };

      Promise.all([
        Menu.update(menu1, {$setOnInsert: menu1}, {upsert: true}).exec(),
        Menu.update(menu2, {$setOnInsert: menu2}, {upsert: true}).exec(),
        Menu.update(menu3, {$setOnInsert: menu3}, {upsert: true}).exec(),
        Menu.update(menu4, {$setOnInsert: menu4}, {upsert: true}).exec(),
        Menu.update(menu5, {$setOnInsert: menu5}, {upsert: true}).exec()
      ]).then(function() { return nlp.refreshUserEntities(business._id); })
        .then(function() { process.exit(); })
        .catch(function(err) { console.log(err.stack); });
    })
  });
});