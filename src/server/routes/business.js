var router         = require('express').Router();
var Business       = require('../model/Business');
var authMiddleware = require('../authMiddleware');
var validators     = require('../validators');
var bcrypt         = require('bcrypt');
var twilio         = require('twilio');
var jwt            = require('jsonwebtoken');
var client         = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var _              = require('underscore');

router.get('/', authMiddleware, async function(req, res) {
  var business = await Business.findById(req.session._id).exec();
  res.send(business);
});

router.put('/', authMiddleware, async function(req, res) {
  var business = await Business.update({_id: req.session._id}, req.body).exec();
  res.send(business);
});

router.post('/create', async function(req, res){
  try {
    await validators.createBusiness(req);
    var business = await Business.create({
      first: req.body.first,
      last: req.body.last,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });
    res.cookie('session', jwt.sign(business, process.env.JWT_SECRET_KEY));
    res.redirect('/');
  } catch (errors) {
    res.render('signup', errors);
  }
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.post('/addphone', authMiddleware, function (req, res) {
  client.incomingPhoneNumbers.create({
    phoneNumber: req.body.phone
  }, function(err, purchasedNumber) {
    if(!err){
      Business.findOne({name: req.session.name}, function(err, business){
        business.botPhone = purchasedNumber.phoneNumber;
        business.save();
        res.redirect('/');
      })
    } else {
      res.send(err);
    } 
  });
});

module.exports = router;