var express        = require('express');
var router         = express.Router();
var authMiddleware = require('../authMiddleware');
var Menu           = require('../model/Menu');
var ai             = require('../util/ai');

router.get('/', authMiddleware, function(req, res) {
  Menu.find({businessId: req.session._id},function (err, menuItems) {
    res.render('menu/menu', {menuItems: menuItems});
  })
});

router.post('/create', authMiddleware, function(req, res){
  var setPrice = req.body.menuPriceDollars.toString().concat(req.body.menuPriceCents.toString());
  Menu.create({businessId: req.session._id, name: req.body.name, description: req.body.description, price: setPrice}, function(err, menu){
    var userEntity = {
      sessionId: menu.businessId,
      name: "food",
      extend: false,
      entries:[{
        value: menu.name,
        synonyms:[menu.name]
      }]
    };
    ai.createUserEntity(userEntity).then(function(){
      res.redirect(req.baseUrl);
    }).catch(function(err){console.log(err);});
  });
});

module.exports = router;

