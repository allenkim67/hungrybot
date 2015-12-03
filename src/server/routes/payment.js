var router    = require('express').Router();
var Customer  = require('../model/Customer');
var Business  = require('../model/Business');
var Order     = require('../model/Order');

router.get('/:id', function(req, res) {
  Order.findById(req.params.id, function(err, order) {
    Customer.findById(order.customerId, function(err, customer) {
      Business.findById(order.businessId, function(err, business) {
      res.render('payment', {order: order, customer: customer, business: business});
      });
    });
  });
});

module.exports = router;