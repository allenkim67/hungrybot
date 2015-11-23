var socketIo = require('socket.io');

var sessionToSocket = {};
var socketToSession = {};

module.exports.init = function(server) {
  var io = socketIo(server);
  io.on('connection', function (socket) {
    socket.on('session', function (sessionId) {
      sessionToSocket[sessionId] = socket;
      socketToSession[socket.id] = sessionId;
      console.log('connect sessionToSocket', sessionToSocket);
      console.log('connect socketToSession', socketToSession);
    });

    socket.on('disconnect', function () {
      var sessionId = socketToSession[socket.id];
      delete sessionToSocket[sessionId];
      delete socketToSession[socket.id];
    });
  });
};

module.exports.trackOrder = function(order, sessionId) {
  console.log(sessionId);
  var socket = sessionToSocket[sessionId];
  console.log(socket);
  socket.emit('newOrder', order);
};