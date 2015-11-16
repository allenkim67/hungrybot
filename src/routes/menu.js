var router         = require('express').Router();
var authMiddleware = require('../authMiddleware');
var Business       = require('../model/Business');

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
  await Business.refreshMenuEntities(req.session);
  res.redirect(req.baseUrl);
});

module.exports = router;