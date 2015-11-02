var express = require('express');
var router  = express.Router();
var User    = require('../model/User');
var bcrypt  = require('bcrypt');

router.get('/logout', function(req, res){
  res.clearCookie('username');
  res.redirect('/');
});

router.post('/login', function(req, res){
  var userData = {username: req.body.username};

  User.findOne(userData, function(err, user){
    if(bcrypt.compareSync(req.body.password, user.password)){
      res.cookie('username', user.username);
      res.redirect('/');
    }
  });
});

module.exports = router;