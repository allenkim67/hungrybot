module.exports = function(aiData) {
  var action = aiData.result.action;
  var params = aiData.result.parameters;

  switch(action) {
    case 'greet':
      return {message: "Hey how's it going?"};

    case 'show_menu':
      return {message: "Here's the menu..."};

    case 'place_order':
      var order1 = params.number1 ? ` and ${params.number1} ${params.food1}` : '';
      return {message: `So you would like ${params.number} ${params.food}${order1}. Does that complete your order?`};

    case 'confirm_order':
      return {message: "Okay sounds great!  Where should we send it too?"};

    case 'get_address':
      return {
        effects: [{type: 'update', model: 'customer', conditions: {address: params}}],
        message: "Okay great who's credit card information we should bill it too?"
      };

    case 'get_cc':
      return {
        effects: [{type: 'payment', card: params, amount: 1000}],
        message: "Alright we're on our way!"
      };

    default:
      return {message: 'Sorry speak louder please.'};
  }
};