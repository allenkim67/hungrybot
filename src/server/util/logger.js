var fs = require('fs');
var path = require('path');

module.exports = function(content) {
  fs.appendFile(path.join(__dirname, '../../../bot.log'), new Date() + ': ' + content + '\n');
};