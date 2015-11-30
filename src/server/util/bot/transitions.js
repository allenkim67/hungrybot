var payment         = require('../payment');
var socket          = require('../socket');
var Menu            = require('../../model/Menu');
var Order           = require('../../model/Order');

module.exports = [
  {
    state: {order: {$exists: false}},
    transitions: [
      {input: 'order', output: [addOrder, confirmOrderPlacement], updateStatus: 'pending'}
    ]
  },
  {
    status: 'pending',
    state: {customer: {address: {$exists: false}, cc: {$exists: false}}},
    transitions: [
      {input: 'confirm', output: getAddress, updateStatus: 'waitingForAddress'}
    ]
  },
  {
    status: 'pending',
    state: {customer: {address: {$exists: true}, cc: {$exists: true}}},
    transitions: [
      {input: 'confirm', output: confirmSavedInfo, updateStatus: 'confirmingSavedInfo'}
    ]
  },
  {
    status: 'pending',
    transitions: [
      {input: 'order', output: [addOrder, confirmOrderPlacement], updateStatus: 'pending'},
      {input: 'deny', output: getNextOrder, updateStatus: 'waitingForNextOrder'}
    ]
  },
  {
    status: 'waitingForNextOrder',
    transitions: [
      {input: 'order', output: [addOrder, confirmOrderPlacement], updateStatus: 'pending'}
    ]
  },
  {
    status: 'waitingForAddress',
    transitions: [
      {input: 'address', output: [saveAddress, getPaymentInfo], updateStatus: 'waitingForPaymentInfo'}
    ]
  },
  {
    status: 'waitingPaymentInfo',
    transitions: [
      {input: 'get_cc', output: [makePayment, completeOrders, trackOrder, finishTransaction]}
    ]
  },
  {
    status: 'confirmingSavedInfo',
    transitions: [
      {input: 'confirm', output: [makePayment, completeOrders, trackOrder, finishTransaction]}
    ]
  },
  {
    state: {order: {$exists: true, items: {$where: 'this.length > 0'}}},
    transitions: [
      {input: 'clearOrder', output: [clearOrders, confirmClearOrders]}
    ]
  },
  {
    state: {},
    transitions: [
      {input: 'greet',       output: greet},
      {input: 'showMenu',    output: showMenu},
      {input: 'clearOrder', output: noOrders},
      {input: '_default',    output: generalErrorMessage}
    ]
  }
];

//RESPONSE OUTPUT
function greet(input) {
  input.message = "Hello, feel free to order from the menu or type 'show menu'.";
  return input;
}

async function showMenu(input) {
  var br = input.options.br;
  var menuItems = await Menu.find({businessId: input.business._id}).exec();
  var menuListing = menuItems.map(function(menuItem, i) {
    return `${i + 1}. ${menuItem.name} -- $${(menuItem.price/100).toFixed(2)}${br}${menuItem.description}`;
  }).join(br);
  input.message =`Here's the menu: ${br}` + menuListing;
  return input;
}

async function confirmOrderPlacement(input) {
  var br = input.options.br;
  var total = '$' + (input.convoState.order.total / 100).toFixed(2);
  var totalOrder = input.convoState.order.items.reduce(function (string, order) {
    return string + br + order.quantity + ' ' + order.item;
  }, '');
  input.message = `So you would like: ${totalOrder} ${br} The total will be ${total}. Does that complete your order?`;
  return input;
}

function getAddress(input) {
  input.message = "What's your address?";
  return input;
}

function getNextOrder(input) {
  input.message = 'What else would you like?';
  return input;
}

function getPaymentInfo(input) {
  input.message = "What's your payment info?";
  return input;
}

function confirmSavedInfo(input) {
  var br = input.options.br;
  var ca = input.convoState.customer.address;
  var address = `${ca.street}${br}${ca.city}, ${ca.state}`;
  input.message = `Send to: ${br} ${address} ${br} Bill to: ${br} **** **** **** ${input.convoState.customer.cc} ${br} Is this correct?`;
  return input;
}

function finishTransaction(input) {
  input.message = 'Thank you come again!';
  return input;
}

function generalErrorMessage(input) {
  input.message = "Sorry I didn't understand that.";
  return input;
}

function confirmClearOrders(input) {
  input.message = "Okay, we've clear your orders.  What would you like to order instead?";
  return input;
}

function noOrders(input) {
  input.message = "You have no orders to cancel.  What would you like to order?";
  return input;
}

// async function removeItemMessage(input) {

//   if() {

//   } else {
//     var total = '$' + (input.models.order.total / 100).toFixed(2);
//     var totalOrder = input.models.order.orders.reduce(function (string, order) {
//       return string + input.br + order.quantity + ' ' + order.item;
//     }, '');
//     return `Here is your updated order: ${totalOrder} ${input.br} The total will be ${total}. Does that complete your order?`;
//   }
// }

//SIDE EFFECTS
async function addOrder(input) {
  var menu = await Menu.findOne({
    businessId: input.business._id,
    name: input.aiData.entities.food}
  ).exec();
  input.convoState.order = await Order.addOrder(input.business._id, input.convoState.customer._id, input.aiData.entities, menu);
  return input;
}

// async function removeItem(input) {
//   console.log(input.aiData.entities);
//   var menu = await Menu.findOneAndUpdate({
//     businessId: input.models.business._id,
//     name: input.aiData.entities.food}
//   ).exec();
//   input.models.order = await Order.removeItem(input.models.business._id, input.models.customer._id, input.aiData.entities, menu);
//   return input;
// }

async function saveAddress(input) {
  input.convoState.customer.address = {
    street: input.aiData.entities.address,
    city: input.aiData.entities['geo-city-us'],
    state: input.aiData.entities['geo-state-us']
  };
  return input;
}

async function makePayment(input) {
  var order = await Order.findOne({
    businessId: input.business._id,
    customerId: input.convoState.customer._id,
    status: 'pending'
  });
  var stripeCustomerId = input.convoState.customer.stripeId || await payment.createCustomerId(input.aiData.entities, input.convoState.customer);
  await payment.makePaymentWithCardInfo(order.total, stripeCustomerId, input.business);
  return input;
}

async function completeOrders(input) {
  input.convoState.order = await Order.findOneAndUpdate({
    businessId: input.business._id,
    customerId: input.convoState.customer._id,
    status: 'pending'
  }, {status: 'paid'}, {new: true});

  return input;
}

function trackOrder(input) {
  socket.io.to(input.business._id.toString()).emit('newOrder', input.convoState.order);
  return input;
}

async function clearOrders(input) {
  await input.convoState.order.remove();
  input.convoState.order = null;
  return input;
}