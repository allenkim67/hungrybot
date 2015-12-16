module.exports.asyncFind = async function(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (await predicate(array[i])) {
      return array[i];
    }
  }
  return null;
};

module.exports.asyncMap = async function(array, f) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    result.push(await f(array[i]));
  }
  return result;
};