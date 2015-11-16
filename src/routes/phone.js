var router   = require('express').Router();
var twilio   = require('twilio');
var client   = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var bot      = require('../util/bot');
var Customer = require('../model/Customer');

router.post('/', async function(req, res) {
  await Customer.createByPhoneIfNotExist(req.body.From);
  var botResponse = await bot(req.body);
  var twiml = new twilio.TwimlResponse();
  twiml.message(botResponse);

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());

});

router.get('/available/:areacode', function(req, res) {
  client.availablePhoneNumbers("US").local.list({ areaCode: req.params.areacode }, function(err, numbers) {
    res.send(numbers.availablePhoneNumbers.map(function(number) {
      return {friendlyName: number.friendlyName, phoneNumber: number.phoneNumber};
    })); 
  });
});

module.exports = router;