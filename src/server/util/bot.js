var _             = require('underscore');
var ai            = require('./ai');
var payment       = require('./payment');
var socket        = require('./socket');
var Menu          = require('../model/Menu');
var Order         = require('../model/Order');
var Business      = require('../model/Business');
var Customer      = require('../model/Customer');
var Combinatorics = require('js-combinatorics');

var bot = module.exports = async function(input) {
  var currState = input.models.customer.convoState;
  var matchedTransition = matchTransition(currState, input);
  var output = await outputFromTransition(matchedTransition, input);
  await input.models.customer.update({
    convoState: Object.assign(currState, matchedTransition.outState)
  });
  return output;

  function matchTransition(currState, input) {
    var currStateCombos = Combinatorics.power(Object.keys(currState)).toArray()
      .map(function(stateKeys) {
        return stateKeys.reduce(function(obj, key) {
          obj[key] = currState[key];
          return obj;
        }, {})
      });

    return transitionTable
      .filter(function(transitionRow) {
        return currStateCombos.some(stateCombo => _.isEqual(stateCombo, transitionRow.inState));
      })
      .sort(function(tRow1, tRow2) {return _.keys(tRow2.inState).length - _.keys(tRow1.inState).length })
      .reduce(function(transitionGroups, transitionRow) {
        return transitionGroups.concat(transitionRow.transitions);
      }, [])
      .find(function(transitionGroup) {
        return transitionGroup.input === input.aiData.result.action || transitionGroup.input === '_error';
      });
  }

  async function outputFromTransition(transition, input) {
    if (Array.isArray(transition.output)) {
      return await transition.output.reduce(async function (input, outputFn) {
        return await outputFn(await input);
      }, input);
    } else {
      return await transition.output(input);
    }
  }
};

module.exports.phoneBot = async function(phoneData) {
  var [customer, business] = await Promise.all([
    Customer.findOne({phone: phoneData.From}).exec(),
    Business.findOne({phone: phoneData.To}).exec()
  ]);

  var aiResponse = await ai.query(phoneData.Body, business._id.toString());
  var botInput = {
    models: {customer: customer, business: business},
    aiData: aiResponse,
    br: '\n'
  };
  return await bot(botInput);
};

module.exports.serverBot = async function(req, res) {
  var DEMO_PHONE = '+12345678900';

  var [business, customer] = await Promise.all([
    Business.findById(req.session._id).exec(),
    Customer.findOne({phone: DEMO_PHONE}).exec()
  ]);

  var aiResponse = await ai.query(req.query.message, business._id.toString());
  var botInput = {
    models: {customer: customer, business: business},
    aiData: aiResponse,
    br: '<br/>'
  };
  res.send(await bot(botInput));
};

//TRANSITIONS
var transitionTable = [
  {
    inState: {},
    transitions: [
      {input: 'greet',       output: greet,               outState: {}},
      {input: 'show_menu',   output: showMenu,            outState: {}},
      {input: 'clear_order', output: noOrders,            outState: {}},
      {input: '_error',      output: generalErrorMessage, outState: {}}
    ]
  },
  {
    inState: {status: 'start'},
    transitions: [
      {input: 'place_order', output: [addOrder, confirmOrderPlacement], outState: {status: 'orderPending'}}
    ]
  },
  {
    inState: {status: 'orderPending', withInfo: false},
    transitions: [
      {input: 'confirm', output: getAddress, outState: {status: 'gettingAddress'}}
    ]
  },
  {
    inState: {status: 'orderPending', withInfo: true},
    transitions: [
      {input: 'confirm', output: confirmSavedInfo, outState: {status: 'confirmingSavedInfo'}}
    ]
  },
  {
    inState: {status: 'orderPending'},
    transitions: [
      {input: 'place_order', output: [addOrder, confirmOrderPlacement], outState: {status: 'orderPending', orderPending: true}},
      {input: 'deny',        output: getNextOrder,                      outState: {status: 'waitingForNextOrder'}}
    ]
  },
  {
    inState: {status: 'waitingForNextOrder'},
    transitions: [
      {input: 'place_order',  output: [addOrder, confirmOrderPlacement], outState: {status: 'orderPending', orderPending: true}}
    ]
  },
  {
    inState: {status: 'gettingAddress'},
    transitions: [
      {input: 'address', output: [saveAddress, getPaymentInfo], outState: {status: 'gettingPaymentInfo'}}
    ]
  },
  {
    inState: {status: 'gettingPaymentInfo'},
    transitions: [
      {input: 'get_cc', output: [makePayment, closeOrders, trackOrder, finishTransaction], outState: {status: 'start', withInfo: true, orderPending: false}}
    ]
  },
  {
    inState: {status: 'confirmingSavedInfo'},
    transitions: [
      {input: 'confirm', output: [makePayment, closeOrders, trackOrder, finishTransaction], outState: {status: 'start', withInfo: true, orderPending: false}}
    ]
  },
  {
    inState: {orderPending: true},
    transitions: [
      {input: 'clear_order', output: [clearOrders, confirmClearOrders], outState: {status: 'start'}}
    ]
  },
];

//RESPONSE OUTPUT
function greet(input) {
  return "Hello this is ${input.name}, feel free to order from the menu or type 'show menu'."
}

async function showMenu(input) {
  var menuItems = await Menu.find({businessId: input.models.business._id}).exec();
  var menuListing = menuItems.map(function(menuItem, i) {
    return `${i + 1}. ${menuItem.name} -- $${(menuItem.price/100).toFixed(2)}${input.br}${menuItem.description}`;
  }).join(input.br);
  return `Here's the menu: ${input.br}` + menuListing;
}

async function confirmOrderPlacement(input) {
  var total = '$' + (input.models.order.total / 100).toFixed(2);
  var totalOrder = input.models.order.orders.reduce(function (string, order) {
    return string + input.br + order.quantity + ' ' + order.item;
  }, '');
  return `So you would like: ${totalOrder} ${input.br} The total will be ${total}. Does that complete your order?`;
}

function getAddress() {
  return "What's your address?";
}

function getNextOrder() {
  return 'What else would you like?';
}

function getPaymentInfo() {
  return "What's your payment info?";
}

function confirmSavedInfo(input) {
  var ca = input.models.customer.address;
  var address = `${ca.street}${input.br}${ca.city}, ${ca.state}`;
  return `Send to: ${input.br} ${address} ${input.br} Bill to: ${input.br} **** **** **** ${input.models.customer.cc} ${input.br} Is this correct?`;
}

function finishTransaction() {
  return 'Thank you come again!';
}

function generalErrorMessage() {
  return "Sorry I didn't understand that.";
}

function confirmClearOrders() {
  return "Okay, we've clear your orders.  What would you like to order instead?";
}

function noOrders() {
  return "You have no orders to cancel.  What would you like to order?";
}

//SIDE EFFECTS
async function addOrder(input) {
  var menu = await Menu.findOne({
    businessId: input.models.business._id,
    name: input.aiData.result.parameters.food}
  ).exec();
  input.models.order = await Order.addOrder(input.models.business._id, input.models.customer._id, input.aiData.result.parameters, menu);
  return input;
}

async function saveAddress(input) {
  input.models.customer.address = {
    street: input.aiData.result.parameters.address,
    city: input.aiData.result.parameters['geo-city-us'],
    state: input.aiData.result.parameters['geo-state-us']
  };
  await input.models.customer.save();
  return input;
}

async function makePayment(input) {
  var order = await Order.findOne({
    businessId: input.models.business._id,
    customerId: input.models.customer._id,
    status: 'pending'
  });
  var stripeCustomerId = input.models.customer.stripeId || await payment.createCustomerId(input.aiData.result.parameters, input.models.customer);
  await payment.makePaymentWithCardInfo(order.total, stripeCustomerId, input.models.business);
  return input;
}

async function closeOrders(input) {
  var order = await Order.findOneAndUpdate({
    businessId: input.models.business._id,
    customerId: input.models.customer._id,
    status: 'pending'
  }, {status: 'paid'}, {new: true});

  input.models.order = order;
  return input;
}

function trackOrder(input) {
  socket.io.to(input.models.business._id.toString()).emit('newOrder', input.models.order);
  return input;
}

async function clearOrders(input) {
  await Order.findOneAndRemove({
    businessId: input.models.business._id,
    customerId: input.models.customer._id,
    status: 'pending'
  });

  return input; 
}