var mongoose = require('mongoose');
var Business = require('./src/server/model/Business');
var Menu     = require("./src/server/model/Menu");

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/hungrybot');

mongoose.connection.on('open', function () {
  var businessData = {
    email: 'hungryDemoBusiness@hungrybot.io'
  };
  Business.findOrCreate(businessData, function(err, business) {
    Menu.findOrCreate({
      businessId: business._id,
      name: 'Krabby Patty',
      description: 'The classic!',
      price: 200
    })
  });
  Business.findOrCreate(businessData, function(err, business) {
    Menu.findOrCreate({
      businessId: business._id,
      name: 'Krusty Combo',
      description: 'Now you can have it all',
      price: 399
    })
  });
  Business.findOrCreate(businessData, function(err, business) {
    Menu.findOrCreate({
      businessId: business._id,
      name: 'Krusty Deluxe',
      description: 'Pure decadence',
      price: 300
    })
  });
  Business.findOrCreate(businessData, function(err, business) {
    Menu.findOrCreate({
      businessId: business._id,
      name: 'Seaweed Salad',
      description: 'For the health conscious sea-dweller',
      price: 200
    })
  });
  Business.findOrCreate(businessData, function(err, business) {
    Menu.findOrCreate({
      businessId: business._id,
      name: 'Coral Bits',
      description: 'A delicious side dish',
      price: 200
    })
  });
});