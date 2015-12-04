var router    = require('express').Router();
var Customer  = require('../model/Customer');
var Business  = require('../model/Business');
var Order     = require('../model/Order');

router.get('/:id', async function(req, res) {
  var order = await Order.findById(req.params.id).exec();
  var customer = await Customer.findById(order.customerId).exec();
  var business = await Business.findById(order.businessId).exec();
  res.render('payment', {order: order, customer: customer, business: business});
});

module.exports = router;