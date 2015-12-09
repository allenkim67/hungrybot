module.exports.asyncFind = async function(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (await predicate(array[i])) {
      return true;
    }
  }
  return false;
};