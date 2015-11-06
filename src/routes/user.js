var express = require('express');
var router  = express.Router();
var User    = require('../model/User');
var bcrypt  = require('bcrypt');

router.post('/create', function(req, res){
  User.create({username: req.body.username, password: bcrypt.hashSync(req.body.password, 8)}, function(err, user){
    res.cookie('username', user.username); //send response to browser and tell browser to store a cookie called username
    res.redirect('/');
  });
});

router.get('/new', function(req, res){
  res.render('new');
});

module.exports = router;