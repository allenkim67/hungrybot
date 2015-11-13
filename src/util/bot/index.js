var ai             = require('../ai');
var getBotResponse = require('./botResponse');
var payment        = require('../payment');
var Customer       = require('../../model/Customer');
var Business       = require('../../model/Business');

module.exports = function(phoneData, callback) {
  Business.findOne({phone: phoneData.To}, function(err, business){
    ai.query(phoneData.Body, business._id).then(function(aiResponse){
      aiRequest.on('response', function(aiResponse) {
        var botResponse = getBotResponse(aiResponse);
        var models = {
          customer: Customer.findOne({phone: phoneData.From}),
          business: Business.findOne({phone: phoneData.To})
        };
        botEffects(botResponse.effects, models);
        callback(botResponse.message);
      });
    });
  });
};

function botEffects(effects, models) {
  if (!effects) return;
  effects.forEach(processEffect);

  function processEffect(effect) {
    switch(effect.type) {
      case 'update':
        models[effect.model].exec().then(function(model) {
          model.update(effect.condition, function() {});
        });
        break;
      case 'payment':
        Promise.all([models.customer.exec(), models.business.exec()]).then(function(customer, business) {
          payment.createCustomerId(params, customer, function(stripeCustomerId) {
            payment.makePaymentWithCardInfo(1000, stripeCustomerId, business);
          });
        });
        break;
    }
  }
}