var express  = require('express');
var router   = express.Router();
var twilio   = require('twilio');
var Customer = require('../model/Customer');
var Business = require('../model/Business');
var bot      = require('../util/bot');
var client   = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/', function(req, res) {
  Customer.findOrCreate({phone: req.body.From}, function(err, customer) {
    Business.findOne({phone: req.body.To}, function(err, business) {
      bot({message: req.body.Body, customer: customer, business: business}, function (aiResponse) {
        var twiml = new twilio.TwimlResponse();
        twiml.message(aiResponse);
        res.set('Content-Type', 'text/xml');
        res.send(twiml.toString());
      });
    });
  });
});

router.get('/available/:areacode', function(req, res) {
  client.availablePhoneNumbers("US").local.list({ areaCode: req.params.areacode }, function(err, numbers) {
    res.send(numbers.availablePhoneNumbers.map(function(number) {
      return {friendlyName: number.friendlyName, phoneNumber: number.phoneNumber};
    })); 
  });
});

module.exports = router;