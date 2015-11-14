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

router.post('/create', authMiddleware, async function(req, res){
  var price = req.body.menuPriceDollars.toString().concat(req.body.menuPriceCents.toString());
  var menuItem = await Menu.create({businessId: req.session._id, name: req.body.name, description: req.body.description, price: price});
  var userEntity = {
    sessionId: menuItem.businessId,
    name: "food",
    extend: false,
    entries:[{
      value: menuItem.name,
      synonyms:[menuItem.name]
    }]
  };
  await ai.createUserEntity(userEntity);
  res.redirect(req.baseUrl);
});

module.exports = router;

