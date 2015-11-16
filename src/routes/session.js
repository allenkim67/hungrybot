var express          = require('express');
var router           = express.Router();
var Business         = require('../model/Business');
var bcrypt           = require('bcrypt');
var jwt              = require('jsonwebtoken');
var authMiddleware   = require('../authMiddleware');
var expressValidator = require('express-validator');
var _                = require('underscore');

router.get('/logout', function(req, res){
  res.clearCookie('session');
  res.redirect('/');
});

router.get('/login', function(req, res) {
  res.render('session/login');
});

router.post('/login', function(req, res){
  req.checkBody('name', 'Username cannot be blank').notEmpty();
  req.checkBody('password', 'Password cannot be blank').notEmpty();  
  var userData = {name: req.body.name};

  req.asyncValidationErrors()
    .then(function() {
      Business.findOne(userData, function(err, business){
        if(bcrypt.compareSync(req.body.password, business.password)){
          res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY));
          res.redirect('/');
        }
      });     
    })
    .catch(function(errors) {
      res.render('session/login', {
        errors: errors, 
        name: _.any(errors, function(error) {return error.param === 'name'}) ? '' : req.body.name, 
      });
    });
});

module.exports = router;