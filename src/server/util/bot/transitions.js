var payment         = require('../payment');
var socket          = require('../socket');
var Menu            = require('../../model/Menu');
var Order           = require('../../model/Order');

module.exports = [
  {
    state: {order: {$exists: false}},
    transitions: [
      {intent: 'order', output: [addOrder, confirmOrderPlacement], updateStatus: 'pending'}
    ]
  },
  {
    state: {order: {$exists: true}},
    transitions: [
      {intent: 'showCurrentOrders', output: currentOrdersMessage}
    ]
  },
  {
    status: 'pending',
    state: {customer: {address: {$exists: false}, cc: {$exists: false}}},
    transitions: [
      {intent: 'confirm', output: "What's your address?", updateStatus: 'waitingForAddress'}
    ]
  },
  {
    status: 'pending',
    state: {customer: {address: {$exists: true}, cc: {$exists: true}}},
    transitions: [
      {intent: 'confirm', output: confirmSavedInfo, updateStatus: 'confirmingSavedInfo'}
    ]
  },
  {
    status: 'pending',
    transitions: [
      {intent: 'order', output: [addOrder, confirmOrderPlacement], updateStatus: 'pending'},
      {intent: 'deny', output: 'What else would you like?', updateStatus: 'waitingForNextOrder'}
    ]
  },
  {
    status: 'waitingForNextOrder',
    transitions: [
      {intent: 'order', output: [addOrder, confirmOrderPlacement], updateStatus: 'pending'}
    ]
  },
  {
    status: 'waitingForAddress',
    transitions: [
      {intent: 'address', output: [saveAddress, "What's your payment info?"], updateStatus: 'waitingForPaymentInfo'}
    ]
  },
  {
    status: 'waitingPaymentInfo',
    transitions: [
      {intent: 'get_cc', output: [makePayment, completeOrders, trackOrder, 'Thank you come again!']}
    ]
  },
  {
    status: 'confirmingSavedInfo',
    transitions: [
      {intent: 'confirm', output: [makePayment, completeOrders, trackOrder, 'Thank you come again!']}
    ]
  },
  {
    state: {order: {$exists: true, items: {$where: 'this.length > 0'}}},
    transitions: [
      {intent: 'clearOrder', output: [clearOrders, "Okay, we've cleared your orders.  What would you like to order instead?"]}
    ]
  },
  {
    state: {},
    transitions: [
      {intent: 'greet',       output: "Hello, feel free to order from the menu or type 'show menu'."},
      {intent: 'showMenu',    output: showMenu},
      {intent: 'clearOrder',  output: "You have no orders to cancel.  What would you like to order?"},
      {intent: 'moreInfo',    output: `You can see the menu by replying "menu", or start ordering by asking for what you would like. For example, "I would like one ____", or "Can I see the menu?"`},
      {intent: '_default',    output: "Reply with 'menu' to see the menu, or you can let us know what you would like to order."}
    ]
  }
];

//RESPONSE OUTPUT
function greet(input) {
  input.message = "Hello.  How may I help you today?  To see the menu reply with 'menu'.";
  return input;
}

async function showMenu(input) {
  var br = input.options.br;
  var menuItems = await Menu.find({businessId: input.business._id}).exec();
  var menuListing = menuItems.map(function(menuItem, i) {
    return `${i + 1}. ${menuItem.name} -- $${(menuItem.price/100).toFixed(2)}${br}${menuItem.description}`;
  }).join(br);
  input.message = menuItems.length ?
    `Here's the menu: ${br}` + menuListing + `What would you like to order?` :
    'This restaurant has not set up a menu yet.';
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

function confirmSavedInfo(input) {
  var br = input.options.br;
  var ca = input.convoState.customer.address;
  var address = `${ca.street}${br}${ca.city}, ${ca.state}`;
  input.message = `Send to: ${br} ${address} ${br} Bill to: ${br} **** **** **** ${input.convoState.customer.cc} ${br} Is this correct?`;
  return input;
}

function currentOrdersMessage(input) {
  var br = input.options.br;
  var total = '$' + (input.convoState.order.total / 100).toFixed(2);
  var totalOrder = input.convoState.order.items.reduce(function (string, order) {
    return string + br + order.quantity + ' ' + order.item;
  }, '');
  input.message = `Currently you have: ${totalOrder} ${br} The subtotal is ${total}. What else would you like?`;
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