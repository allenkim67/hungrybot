var router    = require('express').Router();
var Customer  = require('../model/Customer');
var Business  = require('../model/Business');
var Order     = require('../model/Order');
var payment   = require('../util/payment');
var bot       = require('../util/bot/bot');
var client   = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.get('/:id', async function(req, res) {
  var order = await Order.findById(req.params.id).exec();
  var customer = await Customer.findById(order.customerId).exec();
  var business = await Business.findById(order.businessId).exec();
  res.render('payment', {order: order, customer: customer, business: business});
});

router.post('/', async function(req, res) {
  var order = await Order.findById(req.body.orderId).exec();
  var business = await Business.findById(order.businessId).exec();
  var customer = await Customer.findById(order.customerId).exec();
  var customerInfo = req.body;
  var customerStripeId = await payment.saveStripeCustomer(customerInfo, customer);
  await payment.makePaymentWithCustomerId(order.total, customerStripeId, business);

  var botInput = {
    models: {customer: customer, business: business},
    nlpData: {intent: 'paymentConfirm'},
    options: {br: '<br/>'}
  };
  var botResponse = await bot(botInput);

  client.messages.create({
    to: customer.phone,
    from: business.botPhone,
    body: botResponse
  }, function(err, message) {
    res.send('yay you paid!');
  });
});

module.exports = router;