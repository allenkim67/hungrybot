var ai       = require('./ai');
var Customer = require('../model/Customer');
var Business = require('../model/Business');
var Menu     = require('../model/Menu');

async function getBotResponse(aiData, models) {
  var action = aiData.result.action;
  var params = aiData.result.parameters;

  switch(action) {
    case 'greet':
      return "Hey how's it going?";

    case 'show_menu':
      var menuItems = await Menu.find({businessId: models.business._id}).exec();
      return "Here's the menu: " + menuItems.map(menuItem => menuItem.name).join(' ');

    case 'place_order':
      var order1 = params.number1 ? ` and ${params.number1} ${params.food1}` : '';
      return `So you would like ${params.number} ${params.food}${order1}. Does that complete your order?`;

    case 'confirm_order':
      return "Okay sounds great!  Where should we send it too?";

    case 'get_address':
      var address = {street: params.address, state: params['geo-state-us'], city: params['geo-city-us']};
      models.customer.address = address;
      models.customer.save();
      return "Okay great who's credit card information we should bill it to?";

    case 'get_cc':
      var stripeCustomerId = await payment.createCustomerId(params, models.customer);
      await payment.makePaymentWithCardInfo(1000, stripeCustomerId, models.business);
      return "Alright we're on our way!";

    default:
      return {message: 'Sorry speak louder please.'};
  }
}

module.exports = async function(phoneData) {
  var [customer, business] = await Promise.all([
    Customer.createByPhoneIfNotExist(phoneData.From).exec(),
    Business.findOne({phone: phoneData.To}).exec()
  ]);

  var aiResponse = await ai.query(phoneData.Body, business._id.toString());
  return await getBotResponse(aiResponse, {customer: customer, business: business});
};

// This is for running the bot in terminal for demo purposes.
// Must use babel-node.
if (!module.parent) {
  var readLineSync = require('readline-sync');
  var mongoose     = require('mongoose');
  mongoose.connect(process.env.MONGOLAB_URI);

  var DEMO_NUMBER = '+12136636123';

  var modelsPromise = Promise.all([
    Business.findOne({phone: process.argv[2]}).exec(),
    Customer.findOne({phone: DEMO_NUMBER}).exec()
  ]);

  modelsPromise.then(function(business, customer) {
    var models = {business: business, customer: customer};
    var query = readLineSync.question('Say something to wake the bot: \n');
    var aiResponsePromise = ai.query(query);

    aiResponsePromise.then(function(aiResponse) {
      getBotResponse(aiResponse, models).then(callback);
    });

    function callback(botResponse) {
      query = readLineSync.question(botResponse + '\n');
      var aiResponsePromise = ai.query(query);
      aiResponsePromise.then(function(aiResponse) {
        getBotResponse(aiResponse, models).then(callback);
      });
    }
  });
}