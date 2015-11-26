var R               = require('ramda');
var sift            = require('sift');
var transitionTable = require('./transitions');
var Order           = require('../../model/Order');

module.exports = async function(input) {
  input = await parseInput(input);

  console.log('START STATE:\n', input.convoState);

  var transitionGroup = getTransitionGroup(transitionTable, input);
  var transition = getTransition(transitionGroup, input);
  var output = await applyOutputFns(transition.output, input);

  saveStatus(transition, input);

  console.log('NEXT STATE:\n', output.convoState);

  return output.message;
};

async function applyOutputFns(outputFns, input) {
  return R.isArrayLike(outputFns) ?
    outputFns.reduce(async (input, outputFn) => {return await outputFn(await input);}, input) :
    await outputFns(input);
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
      return transition.input === input.aiData.result.action || transition.input === '_default';
    });

    return statusMatches && stateMatches && transitionMatches;
  });
}

function getTransition(transitionGroup, input) {
  return transitionGroup.transitions.find(transition => {
    return transition.input === input.aiData.result.action || transition.input === '_default';
  });
}

async function saveStatus(transition, input) {
  if (transition.updateStatus) {
    input.convoState.order.status = transition.updateStatus;
    return await input.convoState.order.save();
  }
}