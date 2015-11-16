var router         = require('express').Router();
var Business       = require('../model/Business');
var authMiddleware = require('../authMiddleware');
var validators     = require('../validators');
var bcrypt         = require('bcrypt');
var twilio         = require('twilio');
var jwt            = require('jsonwebtoken');
var client         = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var _              = require('underscore');

router.post('/create', async function(req, res){
  try {
    await validators.createBusiness(req);
    var business = await Business.create({name: req.body.name, password: bcrypt.hashSync(req.body.password, 8)});
    res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY));
    res.redirect('/');
  } catch (errors) {
    res.render('user/new', errors);
  }
});

router.get('/new', function(req, res) {
  res.render('user/new');
});

router.get('/upgrade', authMiddleware, function(req, res) {
  res.render('user/upgrade');
});

router.post('/addphone', authMiddleware, function (req, res) {
  client.incomingPhoneNumbers.create({
    phoneNumber: req.body.phone
  }, function(err, purchasedNumber) {
    if(!err){
      Business.findOne({name: req.session.name}, function(err, business){
        business.phone = purchasedNumber.phoneNumber;
        business.save();
        res.redirect('/');
      })
    } else {
      res.send(err);
    } 
  });
});

module.exports = router;