var R               = require('ramda');
var sift            = require('sift');
var transitionTable = require('./transitions');
var Order           = require('../../model/Order');

module.exports = async function(input) {
  input = await parseInput(input);

  console.log('INPUT:\n', input);

  var transitionGroup = getTransitionGroup(transitionTable, input);
  var transition = getTransition(transitionGroup, input);
  var output = await applyOutputFns(transition.output, input);

  saveStatus(transition, input);

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
    aiData: input.aiData,
    options: input.options
  };
}

function getTransitionGroup(transitionTable, input) {
  return transitionTable.find(transitionGroup => {
    var statusMatches = transitionGroup.status ?
      (input.convoState.order ?
      transitionGroup.status === input.convoState.order.status :
        false) :
      true;

    var stateMatches = transitionGroup.state ?
      sift(transitionGroup.state)(input.convoState) :
      true;

    var transitionMatches = transitionGroup.transitions.find(transition => {
      return transition.intent === input.aiData.intent || transition.intent === '_default';
    });

    return statusMatches && stateMatches && transitionMatches;
  });
}

function getTransition(transitionGroup, input) {
  return transitionGroup.transitions.find(transition => {
    return transition.intent === input.aiData.intent || transition.intent === '_default';
  });
}

async function saveStatus(transition, input) {
  if (transition.updateStatus) {
    input.convoState.order.status = transition.updateStatus;
    return await input.convoState.order.save();
  }
}