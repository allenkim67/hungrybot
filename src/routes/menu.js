var router           = require('express').Router();
var authMiddleware   = require('../authMiddleware');
var Business         = require('../model/Business');
var _                = require('underscore');
var expressValidator = require('express-validator');
var Menu             = require('../model/Menu');

router.get('/', authMiddleware, function(req, res) {
  Menu.find({businessId: req.session._id},function (err, menuItems) {
    res.render('menu/menu', {menuItems: menuItems});
  })
});

router.post('/create', authMiddleware, async function(req, res){
  req.sanitize('name').trim();
  req.sanitize('description').trim();
  req.sanitize('menuPrice').ltrim('$');   
  req.checkBody('name', 'Menu name cannot be blank').notEmpty();
  req.checkBody('name', 'Menu name is already taken').isUniqueMenuName();
  req.checkBody('description', 'Description cannot be blank').notEmpty();
  req.checkBody('menuPrice', 'Please enter a valid amount').isCurrency({allow_negatives: false});

  try{await req.asyncValidationErrors()
    var price = req.body.menuPrice * 100;
    await Menu.create({
      businessId: req.session._id,
      name: req.body.name,
      description: req.body.description,
      price: price
    });
    await Business.refreshMenuEntities(req.session);
    res.redirect(req.baseUrl);
  }
  catch(errors) {
    var menuItems = await Menu.find({businessId: req.session._id}).exec();
    res.render('menu/menu', {
      menuItems: menuItems,
      errors: errors,
      name: _.any(errors, function(error) {return error.param === 'name'}) ? '' : req.body.name,
      description: _.any(errors, function(error) {return error.param === 'description'}) ? '' : req.body.description,
      menuPrice: _.any(errors, function(error) {return error.param === 'menuPrice'}) ? '' : req.body.menuPrice
    })
  };
});

module.exports = router;