var router         = require('express').Router();
var botHandler     = require('../util/bot').serverBot;
var authMiddleware = require('../authMiddleware');

router.get('/demo', authMiddleware, function(req, res) {
  res.render('demo');
});

router.get('/', authMiddleware, botHandler);

module.exports = router;