var router   = require('express').Router();
var twilio   = require('twilio');
var client   = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var bot      = require('../util/bot').phoneBot;
var Customer = require('../model/Customer');

router.post('/', async function(req, res) {
  await Customer.createByPhoneIfNotExist(req.body.From);
  var botResponse = await bot(req.body);
  var twimlMessage = botResponse.message ? `<Body>${botResponse.message}</Body>` : '';
  var twimlImage = botResponse.image ? `<Media>${botResponse.image}</Media>` : '';
  var twiml =
    `<?xml version="1.0" encoding="UTF-8"?>
     <Response>
       <Message>
         ${twimlMessage}
         ${twimlImage}
         ${twimlImage}
       </Message>
     </Response>`;
  res.set('Content-Type', 'text/xml');
  res.send(twiml);
});

router.get('/available/:areacode', function(req, res) {
  client.availablePhoneNumbers("US").local.list({ areaCode: req.params.areacode }, function(err, numbers) {
    res.send(numbers.availablePhoneNumbers.map(function(number) {
      return {friendlyName: number.friendlyName, phoneNumber: number.phoneNumber};
    })); 
  });
});

module.exports = router;