var _        = require('underscore');
var Menu     = require('./model/Menu');
var Business = require('./model/Business');

module.exports.customValidators = {
  isUniqueBusinessName: function(name) {
    return new Promise(function(resolve, reject) {
      Business.findOne({name: name}, function (err, business) {
        business ? reject() : resolve();
      });
    })
  },
  isUniqueMenuName: function(name) {
    return new Promise(function(resolve, reject) {
      Menu.findOne({name: name}, function (err, menuItem) {
        menuItem ? reject() : resolve();
      });
    });
  }
};

module.exports.createMenu = async function(req) {
  req.sanitize('name').trim();
  req.sanitize('description').trim();
  req.sanitize('menuPrice').ltrim('$');
  req.checkBody('name', 'Menu name cannot be blank').notEmpty();
  req.checkBody('name', 'Menu name is already taken').isUniqueMenuName();
  req.checkBody('description', 'Description cannot be blank').notEmpty();
  req.checkBody('menuPrice', 'Please enter a valid amount').isCurrency({allow_negatives: false});

  try {
    await req.asyncValidationErrors(true);
  } catch (errors) {
    var menuItems = await Menu.find({businessId: req.session._id}).exec();
    throw {
      menuItems: menuItems,
      errors: _.values(errors),
      name: _.any(errors, function(error) {return error.param === 'name'}) ? '' : req.body.name,
      description: _.any(errors, function(error) {return error.param === 'description'}) ? '' : req.body.description,
      menuPrice: _.any(errors, function(error) {return error.param === 'menuPrice'}) ? '' : req.body.menuPrice
    };
  }
};

module.exports.createBusiness = async function(req) {
  req.sanitize('name').trim();
  req.sanitize('email').trim();
  req.checkBody('name', 'Username cannot be blank').notEmpty();
  req.checkBody('name', 'Username is already taken').isUniqueBusinessName();
  req.checkBody('email', 'Email is incorrectly formatted').isEmail();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password', 'Password do not match').matches(req.body.verifyPassword);

  try {
    await req.asyncValidationErrors(true);
  } catch (errors) {
    console.log(errors);
    throw {
      errors: _.values(errors),
      name: _.any(errors, function(error) {return error.param === 'name'}) ? '' : req.body.name,
      email: _.any(errors, function(error) {return error.param === 'email'}) ? '' : req.body.email
    }
  }
};