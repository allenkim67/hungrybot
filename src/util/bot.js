var apiai    = require('apiai');
var app      = apiai(process.env.AI_ACCESS_TOKEN, process.env.AI_SUBSCRIPTION_KEY);
var payment  = require('./payment');
var Order    = require('../model/Order');

function botResponse(opts, callback) {
  var message  = opts.message;
  var customer = opts.customer;
  var user     = opts.user;

  var request = app.textRequest(message);
  request.on('response', function(data) {
    callback(buildResponse(data, customer, user));
  });
  request.end();
}

function buildResponse(data, customer, user) {
  var action = data.result.action;
  var params = data.result.parameters;
  switch(action) {
    case 'greet':
      return "Hey how's it going?";
    case 'show_menu':
      return "Here's the menu...";
    case 'place_order':
      var order1 = params.number1 ? ' and ' + params.number1 + " " + params.food1 : '';
      return "So you would like " + params.number + " " + params.food + order1 + ". Does that complete your order?";
    case 'confirm_order':
      return "Okay sounds great!  Where should we send it too?";
    case 'get_address':
      customer.updateAddressWithAiParams(params);
      return "Okay great who's credit card information we should bill it too?";
    case 'get_cc':
      payment.createCustomerId(params, customer, function(stripeCustomerId) {
        payment.makePaymentWithCardInfo(1000, stripeCustomerId, user);
      });
      return "Alright we're on our way!";
    default:
      return 'Sorry speak louder please.';
  }
}

module.exports = botResponse;