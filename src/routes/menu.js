var router              = require('express').Router();
var validators          = require('../validators');
var authMiddleware      = require('../authMiddleware');
var Business            = require('../model/Business');
var Menu                = require('../model/Menu');
var refreshMenuEntities = require('../util/ai').refreshMenuEntities;

router.get('/', authMiddleware, function(req, res) {
  Menu.find({businessId: req.session._id},function (err, menuItems) {
    res.render('menu/menu', {menuItems: menuItems});
  })
});

router.post('/create', authMiddleware, async function(req, res){
  try {
    await validators.createMenu(req);
    await Menu.create({
      businessId: req.session._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.menuPrice * 100
    });
    await refreshMenuEntities(req.session._id);
    res.redirect(req.baseUrl);
  } catch (errors) {
    res.render('menu/menu', errors);
  }
});

module.exports = router;