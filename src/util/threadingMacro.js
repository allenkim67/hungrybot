// http://jondavidjohn.com/clojure-threading-macros-in-javascript/

module.exports = function() {
  var args = Array.prototype.slice.call(arguments);
  var type = args.shift();
  var value = args.shift();

  var func, arg;

  switch (type) {
    case '->;': // thread-first
      while (args.length) {
        arg = args.shift();
        if (arg instanceof Array) {
          func = arg.shift();
          arg.unshift(value);
          value = func.apply(this, arg);
        }
        else {
          value = arg(value);
        }
      }
      break;

    case '->>': // thread-last
      while (args.length) {
        arg = args.shift();
        if (arg instanceof Array) {
          func = arg.shift();
          arg.push(value);
          value = func.apply(this, arg);
        }
        else {
          value = arg(value);
        }
      }
      break;
  }
  return value;
};