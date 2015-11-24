var router         = require('express').Router();
var Order          = require('../model/Order');
var authMiddleware = require('../authMiddleware');


router.get('/', authMiddleware, function(req, res) {
  res.render('orders', {sessionId: req.session._id});
});

router.get('/api', authMiddleware, function(req, res) {
  Order.find({businessId: req.session._id}, function(err, orders){
    res.send(orders);
  });
});

module.exports = router;