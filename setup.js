require("babel-polyfill");
require('babel-core/register');

var mongoose = require('mongoose');
var Business = require('./src/server/model/Business');
var Menu     = require("./src/server/model/Menu");

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/hungrybot');

mongoose.connection.on('open', function () {
  var businessData = {
    email: 'hungryDemoBusiness@hungrybot.io'
  };
  Business.findOrCreate(businessData).then(function(business) {
    var menu1 = {
      businessId: business._id,
      name: 'Krabby Patty',
      description: 'The classic!',
      price: 200
    };
    var menu2 = {
      businessId: business._id,
      name: 'Krusty Combo',
      description: 'Now you can have it all',
      price: 399
    };
    var menu3 = {
      businessId: business._id,
      name: 'Krusty Deluxe',
      description: 'Pure decadence',
      price: 300
    };
    var menu4 = {
      businessId: business._id,
      name: 'Seaweed Salad',
      description: 'For the health conscious sea-dweller',
      price: 200
    };
    var menu5 = {
      businessId: business._id,
      name: 'Coral Bits',
      description: 'A delicious side dish',
      price: 200
    };
    
    Promise.all([
      Menu.update(menu1, {$setOnInsert: menu1}, {upsert: true}).exec(),
      Menu.update(menu2, {$setOnInsert: menu2}, {upsert: true}).exec(),
      Menu.update(menu3, {$setOnInsert: menu3}, {upsert: true}).exec(),
      Menu.update(menu4, {$setOnInsert: menu4}, {upsert: true}).exec(),
      Menu.update(menu5, {$setOnInsert: menu5}, {upsert: true}).exec()
    ]).then(function() { process.exit(); });
  });
});