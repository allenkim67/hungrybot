var payment     = require('../payment');
var geolocation = require('../geolocation');
var socket      = require('../socket');
var Menu        = require('../../model/Menu');
var Order       = require('../../model/Order');
var Business    = require('../../model/Business');

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
  var total = '$' + input.convoState.order.displayTotal();
  var totalOrder = input.convoState.order.items.reduce(function (accString, order) {
    return accString + br + order.quantity + ' ' + order.name;
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
      return string + br + order.quantity + ' ' + order.name;
    }, '');
    input.message = `Currently you have: ${totalOrder} ${br} The subtotal is ${total}.`;
  }
  return input;
}

function minOrderNotMetResponse(input) {
  var minOrder = '$' + (input.business.minimumOrder / 100).toFixed(2);
  input.message = `The minimum order is ${minOrder}.`;
  return input;
}

function sendPaymentLink(input) {
  var orderId = input.convoState.order._id;
  var br = input.options.br;
  input.message = `All fees are included! Just use this link to complete this order: text-delivery.com/payment/${orderId} localhost:3001/payment/${orderId}`;
  return input;
}

function paymentInfoExists(input) {
  var br = input.options.br;  
  var address = `Address: ${br} ${input.convoState.customer.address.street1} ${br} ${input.convoState.customer.address.city}, ${input.convoState.customer.address.zip}`;
  input.message = `Send to: ${br} ${address} ${br} Credit card ending in ${input.convoState.customer.cc} ${br} Does this look correct?`;
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
  var newOrderData = {
    businessId: input.business._id,
    customerId: input.convoState.customer._id,
    orders: input.nlpData.entities.orders
  };
  input.convoState.order = await Order.addOrder(newOrderData);
  return input;
}

 async function removeOrder(input) {
   var removeOrderData = {
     businessId: input.business._id,
     customerId: input.convoState.customer._id,
     orders: input.nlpData.entities.orders
   };
   input.convoState.order = await Order.removeItem(removeOrderData);
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
  await payment.makePaymentWithCustomerId(input.convoState.order.total, input.convoState.customer.stripeId, input.business);
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

//STATE FILTERS
function minOrderNotMet(input) {
  var status = input.convoState.order.status;
  return (status === 'confirmOrder' || status === 'pending') &&
    input.convoState.order.total < input.business.minimumOrder;
}

async function distanceRequirementNotMet(input) {
  var business = await Business.findById(input.business._id);
  var customer = input.convoState.customer;
  var distance = await geolocation.geoCoder(business, customer);

  return (input.convoState.order.status === 'pending' && customer.address && customer.cc && !distance)
}

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
      state: minOrderNotMet,
      output: minOrderNotMetResponse
    },
    {
      state: {order: {status: 'pending'}, customer: {address: {$exists: false}, cc: {$exists: false}}},
      output: [orderStatus('paymentPending'), sendPaymentLink]
    },
    {
      state: distanceRequirementNotMet,
      output: [`Sorry your'e out of our delivery reach!`]
    },
    {
      state: {order: {status: 'pendingConfirmPayment'}, customer: {address: {$exists: true}, cc: {$exists: true}}},
      output: [makePayment, orderStatus('paid'), 'Thank you for your payment.  Expect your delivery within 40-50 minutes']
    }
  ],
  deny: [
    {
      state: {order: {status: 'pending'}},
      output: [orderStatus('waitingForNextOrder'), 'What else would you like?']
    },
    {
      state: {order: {status: 'pendingConfirmPayment'}, customer: {address: {$exists: true}, cc: {$exists: true}}},
      output: [orderStatus('paymentPending'), sendPaymentLink]
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
  paymentConfirm: [
    {
      state: {},
      output: [orderStatus('paid'), "Thanks your order is on its way!"]
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