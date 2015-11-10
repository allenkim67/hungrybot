module.exports = function(req, res, next) {
  req.cookies.session ? next() : res.redirect('/');
};