var R               = require('ramda');
var sift            = require('sift');
var transitionTable = require('./transitions');
var Order           = require('../../model/Order');

module.exports = async function(input) {
  input = await parseInput(input);

  console.log('INPUT:\n', input);

  var transitions = transitionTable[input.nlpData.intent] || transitionTable.NO_MATCH;
  var transition = transitions.find(transition => sift(transition.state)(input.convoState));
  if (!transition) transition = transitionTable.NO_MATCH[0];
  var output = await applyOutputFns(transition.output, input);

  console.log('OUTPUT:\n', output);

  return output.message;
};

async function applyOutputFns(outputFns, input) {
  return R.isArrayLike(outputFns) ?
    outputFns.reduce(applyOutputFn, input) :
    await applyOutputFn(input, outputFns);
}

async function applyOutputFn(input, outputFn) {
  return typeof outputFn === 'string' ?
    R.assoc('message', outputFn, input) :
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