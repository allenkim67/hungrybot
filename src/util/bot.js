var ai       = require('./ai');
var Customer = require('../model/Customer');
var Business = require('../model/Business');
var Menu     = require('../model/Menu');
var Order    = require('../model/Order');

module.exports = async function(phoneData) {
  var [customer, business] = await Promise.all([
    Customer.findOne({phone: phoneData.From}).exec(),
    Business.findOne({phone: phoneData.To}).exec()
  ]);

  var aiResponse = await ai.query(phoneData.Body, business._id.toString());
  return await getBotResponse(aiResponse, {customer: customer, business: business});
};

var getBotResponse = module.exports.getBotResponse = async function(aiData, {business, customer}, opts={newLineDelim: '\n'}) {
  var action = aiData.result.action;
  var params = aiData.result.parameters;
  var br     = opts.newLineDelim;

  switch(action) {
    case 'greet':
      return "Hey how's it going?";

    case 'show_menu':
      var menuItems = await Menu.find({businessId: business._id}).exec();
      var menuListing = menuItems.map(function(menuItem, i) {
        return `${i + 1}. ${menuItem.name} -- $${(menuItem.price/100).toFixed(2)}${br}${menuItem.description}`;
      }).join(br);
      return `Here's the menu: ${br}` + menuListing;

    case 'place_order':
      var menu = await Menu.findOne({businessId: business._id, name: params.food}).exec();
      var order = await Order.addOrder(business._id, customer._id, params, menu);
      var total = '$' + (order.total/100).toFixed(2);
      var totalOrder = order.orders.reduce(function(string, order) {
        return string + br + order.quantity + ' ' + order.item;
      }, '');
      var order1 = params.number1 ? ` and ${params.number1} ${params.food1}` : '';
      return `So you would like: ${totalOrder} ${br} The total will be ${total}. Does that complete your order?`;

    case 'confirm_order':
      return "Okay sounds great!  Where should we send it too?";

    case 'get_address':
      var address = {street: params.address, state: params['geo-state-us'], city: params['geo-city-us']};
      customer.address = address;
      customer.save();
      return "Okay great who's credit card information we should bill it to?";

    case 'get_cc':
      var order = await Order.findOne({businessId: business._id, customerId: customer._id, status: 'pending'});
      var stripeCustomerId = await payment.createCustomerId(params, customer);
      await payment.makePaymentWithCardInfo(order.total, stripeCustomerId, business);
      return "Alright we're on our way!";

    default:
      return 'Sorry speak louder please.';
  }
};