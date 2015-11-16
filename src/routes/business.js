var router         = require('express').Router();
var Business       = require('../model/Business');
var authMiddleware = require('../authMiddleware');
var bcrypt         = require('bcrypt');
var twilio         = require('twilio');
var jwt            = require('jsonwebtoken');
var client         = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var _              = require('underscore');

router.post('/create', function(req, res){
  req.sanitize('name').trim();
  req.sanitize('email').trim();
  req.checkBody('name', 'Username cannot be blank').notEmpty();
  req.checkBody('name', 'Username is already taken').isUniqueBusinessName();
  req.checkBody('email', 'Email cannot be blank').notEmpty();
  req.checkBody('email', 'Email is incorrectly formatted').isEmail();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password', 'Password do not match').matches(req.body.verifyPassword);
  
  req.asyncValidationErrors()
    .then(function() {
      Business.create({name: req.body.name, password: bcrypt.hashSync(req.body.password, 8)}, function(err, business){
        res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY));
        res.redirect('/');
      });
    })
    .catch(function(errors) {
      res.render('user/new', {
        errors: errors, 
        name: _.any(errors, function(error) {return error.param === 'name'}) ? '' : req.body.name, 
        email: _.any(errors, function(error) {return error.param === 'email'}) ? '' : req.body.email
      });
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