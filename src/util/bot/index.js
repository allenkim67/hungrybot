var ai             = require('../ai');
var getBotResponse = require('./botResponse');
var payment        = require('../payment');
var Customer       = require('../../model/Customer');
var Business       = require('../../model/Business');

module.exports = function(phoneData, callback) {
  Promise.all([
    Customer.createByPhoneIfNotExist(phoneData.From).exec(),
    Business.findOne({phone: phoneData.To}).exec()
  ]).then(function(customer, business) {
      ai.query(phoneData.Body, business._id.toString()).then(function(aiResponse){
        var botResponse = getBotResponse(aiResponse);
        var models = {customer: customer, business: business};
        botEffects(botResponse.effects, models, function() {
          callback(botResponse.message);
        });
      });
    }).catch(function(err) {console.log(err);});
};

function botEffects(effects, models, callback) {
  if (!effects) return;
  effects.forEach(processEffect);

  function processEffect(effect) {
    switch(effect.type) {
      case 'update':
        models[effect.model].update(effect.condition, callback);
        break;
      case 'payment':
        payment.createCustomerId(params, models.customer, function(stripeCustomerId) {
          payment.makePaymentWithCardInfo(1000, stripeCustomerId, models.business, callback);
        });
        break;
    }
  }
}