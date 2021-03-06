var _        = require('underscore');
var Menu     = require('./model/Menu');
var Business = require('./model/Business');
var bcrypt   = require('bcrypt');

module.exports.customValidators = {
  isUniqueEmail: function(email) {
    return new Promise(function(resolve, reject) {
      Business.findOne({email: email}, function (err, business) {
        business ? reject() : resolve();
      });
    })
  },
  isUniqueMenuName: function(name, sessionId, menuId) {
    return new Promise(function(resolve, reject) {
      Menu.findOne({name: name, businessId: sessionId}, function (err, menuItem) {
        !menuItem || menuItem._id.toString() === menuId ? resolve() : reject();
      });
    });
  },
  isCorrectCreds: function(rawPass, business) {
    return !!business && bcrypt.compareSync(rawPass, business.password);
  }
};

module.exports.menu = async function(req) {
  req.sanitize('name').trim();
  req.sanitize('description').trim();
  req.sanitize('price').ltrim('$');
  req.checkBody('name', 'Menu name cannot be blank').notEmpty();
  req.checkBody('name', 'Menu name is already taken').isUniqueMenuName(req.session._id, req.params.id);
  req.checkBody('description', 'Description cannot be blank').notEmpty();
  req.checkBody('price', 'Please enter a valid amount').isCurrency({allow_negatives: false});

  try {
    await req.asyncValidationErrors(true);
  } catch (errors) {
    throw _.values(errors);
  }
};

module.exports.createBusiness = async function(req) {
  req.sanitize('first').trim();
  req.sanitize('last').trim();
  req.sanitize('email').trim();
  req.checkBody('email', 'Email is already taken. Did you forget your password? Click here.').isUniqueEmail();
  req.checkBody('email', 'Email is incorrectly formatted').isEmail();
  req.checkBody('first', 'First name cannot be blank').notEmpty();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password', 'Password do not match').matches(req.body.verifyPassword);

  try {
    await req.asyncValidationErrors(true);
  } catch (errors) {
    throw {
      errors: _.values(errors),
      name: _.any(errors, function(error) {return error.param === 'name'}) ? '' : req.body.name,
      email: _.any(errors, function(error) {return error.param === 'email'}) ? '' : req.body.email
    }
  }
};

module.exports.login = function(req, business) {
  req.sanitize('email').trim();
  req.checkBody('email', 'Email is incorrectly formatted').isEmail();
  req.checkBody('password', 'Username or password is incorrect').isCorrectCreds(business);
  req.checkBody('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors(true);

  return errors ? {
    errors: _.values(errors),
    name: _.any(errors, function(error) {return error.param === 'email'}) ? '' : req.body.email
  } : null;
};

module.exports.profile = async function(req) {
  req.checkBody('address[street]', 'Street cannot be blank').notEmpty();
  req.checkBody('address[city]', 'City cannot be blank').notEmpty();
  req.checkBody('address[zipCode]', 'Zip Code cannot be blank.').notEmpty();
  req.checkBody('minimumOrder', 'Please enter a valid amount').isCurrency({allow_negatives: false});

  try {
    await req.asyncValidationErrors(true);
  } catch (errors) {
    throw {
      errors: _.values(errors),
    }
  }
};
