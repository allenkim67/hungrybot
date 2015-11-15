var router         = require('express').Router();
var getBotResponse = require('../util/bot').getBotResponse;
var authMiddleware = require('../authMiddleware');
var ai             = require('../util/ai');
var Business       = require('../model/Business');
var Customer       = require('../model/Customer');

var DEMO_PHONE = '+12345678900';

router.get('/demo', authMiddleware, function(req, res) {
  res.render('demo');
});

router.get('/', authMiddleware, async function(req, res) {
  var [business, customer] = await Promise.all([
    Business.findById(req.session._id).exec(),
    Customer.findOne({phone: DEMO_PHONE}).exec()
  ]);
  var aiResponse = await ai.query(req.query.message, business._id.toString());
  res.send(await getBotResponse(aiResponse, {customer: customer, business: business}));
});

module.exports = router;