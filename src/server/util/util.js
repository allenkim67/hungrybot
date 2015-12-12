module.exports.asyncFind = async function(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (await predicate(array[i])) {
      console.log('5', await predicate(array[i]));
      console.log('6', array[i]);
      return array[i];
    }
  }
  return null;
};