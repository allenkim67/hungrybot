var express        = require('express');
var router         = express.Router();
var Business       = require('../model/Business');
var bcrypt         = require('bcrypt');
var authMiddleware = require('../authMiddleware');

router.get('/logout', authMiddleware, function(req, res){
  res.clearCookie('session');
  res.redirect('/');
});

router.post('/login', function(req, res){
  var userData = {name: req.body.name};

  Business.findOne(userData, function(err, business){
    if(bcrypt.compareSync(req.body.password, business.password)){
      res.cookie('session', business);
      res.redirect('/');
    }
  });
});

module.exports = router;