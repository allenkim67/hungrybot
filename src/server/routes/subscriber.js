var router         = require('express').Router();
var Subscriber     = require('../model/Subscriber');
var nodemailer     = require('nodemailer');

router.post('/', function(req, res){
  var transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'textdelivery.contact@gmail.com',
      pass: process.env.GMAIL_PASS
    }
  });

  var mailOptions = {
      from: 'Text Delivery <textdelivery.contact@gmail.com>',
      to: req.body.email, 
      subject: "You're in "+ req.body.name +"!", 
      html: "<h2> Welcome "+ req.body.name +"</h2><br><p>We'll keep you up to date on Text Delivery!</p>"
  };  

  transport.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      };
  });

  Subscriber.create(req.body, function(err, subscriber) {
    res.send(subscriber);
  });
});

module.exports = router;
