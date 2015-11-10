module.exports = function(req, res, next) {
  req.cookies.name ? next() : res.redirect('/');
};