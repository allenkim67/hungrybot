var router         = require('express').Router();
var botHandler     = require('../util/bot').serverBot;
var authMiddleware = require('../authMiddleware');

router.get('/private', authMiddleware, botHandler());
router.get('/public', botHandler("564faafc5c66300059c67949"));

module.exports = router;