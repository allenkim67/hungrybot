var Menu = require('../model/Menu');
var Order = require('../model/Order');
var payment  = require('./payment');

var fsm = module.exports = async function (currState, input) {
  var currTrans = transitions[currState];
  var transFns = currTrans ? currTrans.find(transition => transition.event === input.eventType) : null;

  var globValue = '';
  while (!transFns) {
    if (currTrans === '*') {
      throw new Error('Current state does not exist!')
    }
    globValue = [globValue, currState.replace(/^(\*\/)*/, '').split('/').shift()].filter(Boolean).join('/');
    currState = ['*', currState.replace(/^(\*\/)*/, '').split('/').slice(1).join('/')].filter(Boolean).join('/');
    currTrans = transitions[currState];
    transFns = currTrans ? currTrans.find(transition => transition.event === input.eventType) : null;
  }

  var output;
  if (Array.isArray(transFns.output)) {
    output = await transFns.output.reduce(async function (input, transFn) {
      return await transFn(await input);
    }, input);
  } else {
    output = await transFns.output(input);
  }

  input.customer.convoState = transFns.nextState.replace(/(\*|\*\/)/, globValue);
  console.log(input.customer.convoState);
  await input.customer.save();

  return output;
};

module.exports.getBotResponse = function(aiData, {business, customer}, opts={newLineDelim: '\n'}) {
  aiData.business = business;
  aiData.customer = customer;
  aiData.eventType = aiData.result.action;
  aiData.params = aiData.result.parameters;
  aiData.br = opts.newLineDelim;

  return fsm(customer.convoState || 'noInfo/start', aiData);
};

//TRANSITIONS
var transitions = {
  '*': [
    {event: 'greet',        output: greet,                             nextState: '*'},
    {event: 'show_menu',    output: showMenu,                          nextState: '*'}
  ],
  '*/start': [
    {event: 'place_order',  output: [addOrder, confirmOrderPlacement], nextState: `*/orderPending`}
  ],
  '*/orderPending': [
    {event: 'place_order',  output: [addOrder, confirmOrderPlacement], nextState: `*/orderPending`},
    {event: 'deny',         output: getNextOrder,                      nextState: '*/waitingForNextOrder'}
  ],
  'noInfo/orderPending': [
    {event: 'confirm',      output: getAddress,                        nextState: 'gettingAddress'}
  ],
  'withInfo/orderPending': [
    {event: 'confirm',      output: confirmSavedInfo,                  nextState: 'confirmingSavedInfo'}
  ],
  '*/waitingForNextOrder': [
    {event: 'place_order',  output: [addOrder, confirmOrderPlacement], nextState: `*/orderPending`}
  ],
  gettingAddress: [
    {event: 'address',      output: [saveAddress, getPaymentInfo],     nextState: 'gettingPaymentInfo'}
  ],
  gettingPaymentInfo: [
    {event: 'get_cc',       output: [closeOrder, finishTransaction],                 nextState: 'withInfo/start'}
  ],
  confirmingSavedInfo: [
    {event: 'confirm',      output: [closeOrder, finishTransaction],                 nextState: 'withInfo/start'}
  ]
};

//RESPONSE OUTPUT
function greet(input) {
  return "Hello this is ${input.name}, feel free to order from the menu or type 'show menu'."
}

async function showMenu(input) {
  var menuItems = await Menu.find({businessId: input.business._id}).exec();
  var menuListing = menuItems.map(function(menuItem, i) {
    return `${i + 1}. ${menuItem.name} -- $${(menuItem.price/100).toFixed(2)}${input.br}${menuItem.description}`;
  }).join(input.br);
  return `Here's the menu: ${input.br}` + menuListing;
}

async function confirmOrderPlacement(input) {
  var total = '$' + (input.order.total / 100).toFixed(2);
  var totalOrder = input.order.orders.reduce(function (string, order) {
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
  var ca = input.customer.address;
  var address = `${ca.street}${input.br}${ca.city}, ${ca.state}`;
  return `Send to: ${input.br} ${address} ${input.br} Bill to: ${input.br} **** **** **** ${input.customer.cc} ${input.br} Is this correct?`;
}

function finishTransaction() {
  return 'Thank you come again!';
}

//SIDE EFFECTS
async function addOrder(input) {
  var menu = await Menu.findOne({businessId: input.business._id, name: input.params.food}).exec();
  input.order = await Order.addOrder(input.business._id, input.customer._id, input.params, menu);
  return input;
}

async function saveAddress(input) {
  input.customer.address = {
    street: input.params.address,
    city: input.params['geo-city-us'],
    state: input.params['geo-state-us']
  };
  await input.customer.save();
  return input;
}

async function makePayment(input) {
  var order = await Order.findOne({
    businessId: input.business._id,
    customerId: input.customer._id,
    status: 'pending'
  });
  var stripeCustomerId = await payment.createCustomerId(input.params, input.customer);
  await payment.makePaymentWithCardInfo(order.total, stripeCustomerId, input.business);
}

async function closeOrder(input) {
  await Order.findOneAndUpdate({
    businessId: input.business._id,
    customerId: input.customer._id,
    status: 'pending'
  }, {status: 'complete'});

  return input;
}