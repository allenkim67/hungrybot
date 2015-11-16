module.exports = function(fn, wait) {
  var argMap = {};
  return function() {
    var args = JSON.stringify(arguments);
    if (!argMap[args]) {
      fn.apply(this, arguments);
      argMap[args] = true;
      setTimeout(function() {
        delete argMap[args];
      }, wait);
    }
  }
};