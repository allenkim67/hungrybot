var router         = require('express').Router();
var Subscriber     = require('../model/Subscriber');

router.post('/', function(req, res){
  Subscriber.create(req.body, function(err, subscriber) {
    res.send(subscriber);
  });
});

module.exports = router;