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
  await Menu.create({
    businessId: req.session._id,
    name: req.body.name,
    description: req.body.description,
    price: price
  });

  var menu = await Menu.find({businessId: req.session._id}).exec();
  var userEntity = {
    sessionId: req.session._id,
    name: "food",
    extend: false,
    entries: menu.map(function(menuItem) {
      return {
        value: menuItem.name,
        synonyms: [menuItem.name]
      }
    })
  };
  await ai.createUserEntity(userEntity);
  res.redirect(req.baseUrl);
});

module.exports = router;