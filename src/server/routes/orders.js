var router         = require('express').Router();
var Order          = require('../model/Order');
var authMiddleware = require('../authMiddleware');

router.get('/api', authMiddleware, function(req, res) {
  Order.find({}, function(err, orders) {
    res.send(orders);
  });
});

module.exports = router;