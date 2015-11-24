var socketMap = {};

io.on('connection', function (socket) {
  socket.on('session', function (data) {
    console.log(data);
  });
});

module.exports = io;