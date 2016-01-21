var router      = require('express').Router();
var Customer    = require('../model/Customer');
var Business    = require('../model/Business');
var Order       = require('../model/Order');
var payment     = require('../util/payment');
var geolocation = require('../util/geolocation');
var bot         = require('../util/bot/bot');
var client      = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

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
  var distanceRequirement = await geolocation.geoCoder(business, customer);

  if(distanceRequirement) {
    await payment.makePaymentWithCustomerId(order.total(), customerStripeId, business);
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
      console.log('TEXT ERROR: ',err);
      res.redirect("www.text-delivery.com");
    });
  } else {
    var botInput = {
      models: {customer: customer, business: business},
      nlpData: {intent: 'pending'},
      options: {br: '<br/>'}
    };
    var botResponse = await bot(botInput);

    client.messages.create({
      to: customer.phone,
      from: business.botPhone,
      body: botResponse
    }, function(err, message) {
      res.send(`Sorry your'e out of our delivery reach!`);
    });
  }
});

module.exports = router;