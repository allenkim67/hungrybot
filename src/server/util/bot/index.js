var ai       = require('../ai');
var Business = require('../../model/Business');
var Customer = require('../../model/Customer');
var bot      = require('./bot');

module.exports.phoneBot = async function(phoneData) {
  var [customer, business] = await Promise.all([
    Customer.findOne({phone: phoneData.From}).exec(),
    Business.findOne({phone: phoneData.To}).exec()
  ]);

  var aiResponse = await ai.query(phoneData.Body, business._id.toString());
  var botInput = {
    models: {customer: customer, business: business},
    aiData: aiResponse,
    options: {br: '\n'}
  };
  return await bot(botInput);
};

module.exports.serverBot = options => async (req, res) => {
  var business = options.public ?
    await Business.findOne({email: 'hungryDemoBusiness@hungrybot.io'}).exec() :
    await Business.findById(req.session._id).exec();

  var customer = req.cookies.demoCustomer ?
    await Customer.findById(req.cookies.demoCustomer).exec() :
    await Customer.create({phone: Math.random().toString(36)});

  res.cookie('demoCustomer', customer._id);

  var aiResponse = await ai.query(req.query.message, business._id.toString());
  var botInput = {
    models: {customer: customer, business: business},
    aiData: aiResponse,
    options: {br: '<br/>'}
  };
  res.send(await bot(botInput));
};