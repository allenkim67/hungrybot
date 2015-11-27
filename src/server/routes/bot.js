var router         = require('express').Router();
var botHandler     = require('../util/bot').serverBot;
var authMiddleware = require('../authMiddleware');

router.get('/private', authMiddleware, botHandler({public: false}));
router.get('/public', botHandler({public: true}));

module.exports = router;