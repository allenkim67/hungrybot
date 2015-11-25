var router         = require('express').Router();
var bcrypt         = require('bcrypt');
var jwt            = require('jsonwebtoken');
var Business       = require('../model/Business');
var authMiddleware = require('../authMiddleware');
var validators     = require('../validators');

router.get('/logout', function(req, res){
  res.clearCookie('session');
  res.redirect('/');
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', async function(req, res){
    var business = await Business.findOne({email: req.body.email}).exec();
    var errors = validators.login(req, business);
    res.clearCookie('demoCustomer');
    if (errors) {
      res.render('session/login', errors);
    } else {
      res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY));
      res.redirect('/home');
    }
});

module.exports = router;