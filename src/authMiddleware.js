var jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  if (req.cookies.session) {
    try {
      req.session = jwt.verify(req.cookies.session, process.env.JWT_SECRET_KEY);
    } catch (err) {
      res.clearCookie('session');
      res.redirect('/');
    }
    next();
  } else {
    res.redirect('/');
  }
};