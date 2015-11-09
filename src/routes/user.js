var express = require('express');
var router  = express.Router();
var User    = require('../model/User');
var bcrypt  = require('bcrypt');
var twilio  = require('twilio');
var client  = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/create', function(req, res){
  User.create({username: req.body.username, password: bcrypt.hashSync(req.body.password, 8)}, function(err, user){
    res.cookie('username', user.username); //send response to browser and tell browser to store a cookie called username
    res.redirect('/');
  });
});

router.get('/new', function(req, res) {
  res.render('user/new');
});

router.get('/upgrade', function(req, res) {
  res.render('user/upgrade');
});

router.post('/addphone', function (req, res) {
  client.incomingPhoneNumbers.create({
    phoneNumber: req.body.phone
  }, function(err, purchasedNumber) {
    console.log(JSON.stringify(purchasedNumber));
    if(!err){
      User.findOne({username: req.cookies.username}, function(err, user){
        user.phone = req.body.phone
        user.save();
      })
    } else {console.log(err)} 
  });
});



module.exports = router;