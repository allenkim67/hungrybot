var express        = require('express');
var router         = express.Router();
var Business       = require('../model/Business');
var authMiddleware = require('../authMiddleware');
var bcrypt         = require('bcrypt');
var twilio         = require('twilio');
var jwt            = require('jsonwebtoken');
var client         = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/create', function(req, res){
  Business.create({name: req.body.name, password: bcrypt.hashSync(req.body.password, 8)}, function(err, business){
    res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY)); //send response to browser and tell browser to store a cookie called username
    res.redirect('/');
  });
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