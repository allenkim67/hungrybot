function findOrCreatePlugin(schema) {
  schema.statics.findOrCreate = function(conditions) {
    var that = this;
    return this.findOne(conditions).exec()
      .then(function (result) {
        if (result) {
          return result;
        } else {
          return that.create(conditions);
        }
      });
  }
}

module.exports = findOrCreatePlugin;