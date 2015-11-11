var express        = require('express');
var router         = express.Router();
var authMiddleware = require('../authMiddleware');
var Menu           = require('../model/Menu');

router.get('/', authMiddleware, function(req, res) {
  Menu.find({businessId: req.session._id},function (err, menuItems) {
    res.render('menu/menu', {menuItems: menuItems});
  })
});

router.post('/create', authMiddleware, function(req, res){
  var setPrice = req.body.menuPriceDollars.toString().concat(req.body.menuPriceCents.toString());
  Menu.create({businessId: req.session._id, name: req.body.name, description: req.body.description, price: setPrice}, function(){
    res.redirect(req.baseUrl);
  });
});

module.exports = router;