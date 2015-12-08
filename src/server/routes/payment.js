var router    = require('express').Router();
var Customer  = require('../model/Customer');
var Business  = require('../model/Business');
var Order     = require('../model/Order');
var payment   = require('../util/payment');
// var stripe    = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
  payment.makePaymentWithCustomerId(order.total, customerStripeId, business);
  payment.customerPaymentConfirmed(order);

}); 

module.exports = router;