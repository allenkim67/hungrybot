var nlp      = require('../nlp');
var Business = require('../../model/Business');
var Customer = require('../../model/Customer');
var bot      = require('./bot');
var asyncMap = require('../util').asyncMap;

module.exports.phoneBot = async function(phoneData) {
  var [customer, business] = await Promise.all([
    Customer.findOne({phone: phoneData.From}).exec(),
    Business.findOne({botPhone: phoneData.To}).exec()
  ]);
  var nlpResponse = await nlp.query(phoneData.Body, business._id.toString());
  var br = '\n';
  var responseMessages = await asyncMap(nlpResponse.intents, async function(nlpData) {
    var botInput = {
      models: {customer: customer, business: business},
      nlpData: nlpData,
      options: {br: br}
    };
    return await bot(botInput);
  });

  return responseMessages.join(br + br);
};

module.exports.serverBot = options => async (req, res) => {
  var business = options.public ?
    await Business.findOne({email: 'hungryDemoBusiness@hungrybot.io'}).exec() :
    await Business.findById(req.session._id).exec();
  var customer = req.cookies.demoCustomer ?
    await Customer.findById(req.cookies.demoCustomer).exec() :
    await Customer.create({phone: Math.random().toString(36)});
  var br = '<br/>';

  res.cookie('demoCustomer', customer._id);

  var nlpResponse = await nlp.query(req.query.message, business._id.toString());
  var responseMessages = await asyncMap(nlpResponse.intents, async function(nlpData) {
    var botInput = {
      models: {customer: customer, business: business},
      nlpData: nlpData,
      options: {br: br}
    };
    return await bot(botInput);
  });

  res.send(responseMessages.join(br + br));
};