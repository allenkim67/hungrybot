var express = require('express');
var router  = express.Router();
var Menu    = require('../model/Menu');

router.get('/', function(req, res) {
  Menu.find(function (err, items) {
    res.render('../views/menu', {items: items});
  })
});

router.post('/create', function(req, res){
  var setPrice = req.body.menuPriceDollars.toString().concat(req.body.menuPriceCents.toString());
  Menu.create({name: req.body.name, description: req.body.description, price: setPrice}, function(){
    res.redirect(req.baseUrl);
  });
});

module.exports = router;