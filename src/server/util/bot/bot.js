var R               = require('ramda');
var sift            = require('sift');
var transitionTable = require('./transitions');
var Order           = require('../../model/Order');
var {asyncFind}     = require('../util');

module.exports = async function(input) {
  input = await parseInput(input);

  console.log('INPUT:\n', input);
  
  var transitions = transitionTable[input.nlpData.intent] || transitionTable.NO_MATCH;
  var transition = await asyncFind(transitions, R.partial(filterByState, [input]));
  if (!transition) transition = transitionTable.NO_MATCH[0];
  var output = await applyOutputFns(transition.output, input);

  console.log('OUTPUT:\n', output);

  return output.message;
};

async function filterByState(input, transition) {
  if (typeof transition.state === 'object') {
    return sift(transition.state)(input.convoState);
  } else if (typeof transition.state === 'function') {
    return await transition.state(input);
  } else {
    if (process.env.NODE_ENV !== 'production') throw new Error('State filter must be a function or an object.');
  }
}

async function applyOutputFns(outputFns, input) {
  return R.isArrayLike(outputFns) ?
    outputFns.reduce(applyOutputFn, input) :
    await applyOutputFn(input, outputFns);
}

async function applyOutputFn(input, outputFn) {
  return typeof outputFn === 'string' ?
    R.assoc('message', outputFn, await input) :
    await outputFn(await input);
}

async function parseInput(input) {
  var order = await Order.findOne({
    businessId: input.models.business._id,
    customerId: input.models.customer._id,
    status: {$nin: 'paid'}
  });

  return {
    convoState: {customer: input.models.customer, order: order},
    business: input.models.business,
    nlpData: input.nlpData,
    options: input.options
  };
}