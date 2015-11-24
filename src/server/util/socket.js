var io = require('socket.io');

module.exports = {
  init: function(server) {
    this.io = io(server);
  }
};
