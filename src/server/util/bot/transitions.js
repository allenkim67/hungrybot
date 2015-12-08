var payment = require('../payment');
var socket  = require('../socket');
var Menu    = require('../../model/Menu');
var Order   = require('../../model/Order');

module.exports = {
  address: [
    {
      state: {order: {status: 'waitingForAddress'}},
      output: [saveAddress, orderStatus('waitingForPaymentInfo'), "what's your payment info?"]
    }
  ],
  clearOrder: [
    {
      state: {order: {$exists: true, items: {$where: 'this.length > 0'}}},
      output: [clearOrders, "Okay we've cleared your orders. What would you like to order instead?"]
    },
    {
      state: {},
      output: ['You have no orders to cancel. What would you like to order?']
    }
  ],
  confirm: [
    {
      state: {order: {status: 'pending'}, customer: {address: {$exists: false}, cc: {$exists: false}}},
      output: [orderStatus('waitingForAddress'), "What's your address?"]
    },
    {
      state: {order: {status: 'pending'}, customer: {address: {$exists: true}, cc: {$exists: true}}},
      output: [orderStatus('confirmingSavedInfo'), confirmSavedInfo]
    },
    {
      state: {order: {status: 'confirmingSavedInfo'}},
      output: [makePayment, completeOrders, trackOrder, 'Thank you come again']
    }
  ],
  deny: [
    {
      state: {order: {status: 'pending'}},
      output: [orderStatus('waitingForNextOrder'), 'What else would you like?']
    }
  ],
  get_cc: [
    {
      state: {order: {status: 'waitingPaymentInfo'}},
      output: [makePayment, completeOrders, trackOrder, 'Thank you come again!']
    }
  ],
  greet: [
    {
      state: {},
      output: greetMessage
    }
  ],
  moreInfo: [
    {
      state: {},
      output: `You can see the menu by replying "menu", or start ordering by asking for what you would like. For example, "I would like one ____", or "Can I see the menu?"`
    }
  ],
  order: [
    {
      state: {order: {$exists: false}},
      output: [addOrder, orderStatus('pending'), orderMessage]
    },
    {
      state: {order: {status: 'pending'}},
      output: [addOrder, orderStatus('pending'), orderMessage]
    },
    {
      state: {order: {status: 'waitingForNextOrder'}},
      output: [orderStatus('pending'), addOrder, orderMessage]
    }
  ],
  removeOrder: [
    {
      state: {order: {$exists: true}},
      output: [removeOrder, currentOrdersMessage]
    }
  ],
  showCurrentOrders: [
    {
      state: {order: {$exists: false}},
      output: 'You have no current orders.'
    },
    {
      state: {order: {$exists: true}},
      output: currentOrdersMessage
    }
  ],
  showMenu: [
    {
      state: {},
      output: showMenu
    }
  ],
  NO_MATCH: [
    {
      state: {},
      output: "Reply with 'menu' to see the menu, or you can let us know what you would like to order."
    }
  ]
};

//RESPONSE OUTPUT
function greetMessage(input) {
  input.message = `Welcome to ${input.business.name}! How can we help you? Text "menu" to see the menu.`;
  return input;
}

async function showMenu(input) {
  var br = input.options.br;
  var menuItems = await Menu.find({businessId: input.business._id}).exec();
  var menuListing = menuItems.map(function(menuItem, i) {
    return `${i + 1}. ${menuItem.name} -- $${(menuItem.price/100).toFixed(2)}${br}${menuItem.description}`;
  }).join(br);
  var menuMessage =
    `Here's the menu:${br}
    ${menuListing}
    ${br}
    What would you like to order?`;

  input.message = menuItems.length ? menuMessage : 'This restaurant has not set up a menu yet.';

  return input;
}

async function orderMessage(input) {
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
  if (!input.convoState.order) {
    input.message = 'You have no current orders. Subtotal is $0.00.';
  } else {
    var br = input.options.br;
    var total = '$' + (input.convoState.order.total / 100).toFixed(2);
    var totalOrder = input.convoState.order.items.reduce(function (string, order) {
      return string + br + order.quantity + ' ' + order.item;
    }, '');
    input.message = `Currently you have: ${totalOrder} ${br} The subtotal is ${total}.`;
  }
  return input;
}

//SIDE EFFECTS
function orderStatus(status) {
  return function(input) {
    input.convoState.order.status = status;
    input.convoState.order.save();
    return input;
  }
}

async function addOrder(input) {
  var menu = await Menu.findOne({
    businessId: input.business._id,
    name: input.nlpData.entities.food}
  ).exec();
  input.convoState.order = await Order.addOrder(input.business._id, input.convoState.customer._id, input.nlpData.entities, menu);
  return input;
}

 async function removeOrder(input) {
   var menu = await Menu.findOne({
     businessId: input.business._id,
     name: input.nlpData.entities.food
   }).exec();
   input.convoState.order = await Order.removeItem(input.business._id, input.convoState.customer._id, input.nlpData.entities, menu);
   return input;
 }

async function saveAddress(input) {
  input.convoState.customer.address = {
    street: input.nlpData.entities.address,
    city: input.nlpData.entities['geo-city-us'],
    state: input.nlpData.entities['geo-state-us']
  };
  return input;
}

async function makePayment(input) {
  var order = await Order.findOne({
    businessId: input.business._id,
    customerId: input.convoState.customer._id,
    status: 'pending'
  });
  var stripeCustomerId = input.convoState.customer.stripeId || await payment.createCustomerId(input.nlpData.entities, input.convoState.customer);
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