var express        = require('express');
var router         = express.Router();
var Business       = require('../model/Business');
var bcrypt         = require('bcrypt');
var jwt            = require('jsonwebtoken');
var authMiddleware = require('../authMiddleware');

router.get('/logout', function(req, res){
  res.clearCookie('session');
  res.redirect('/');
});

router.get('/login', function(req, res) {
  res.render('session/login');
});

router.post('/login', function(req, res){
  var userData = {name: req.body.name};

  Business.findOne(userData, function(err, business){
    if(bcrypt.compareSync(req.body.password, business.password)){
      res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY));
      res.redirect('/');
    }
  });
});

module.exports = router;