module.exports = function(req, res, next) {
  req.cookies.username ? next() : res.redirect('/');
};