var apiai          = require('apiai')(process.env.AI_CLIENT_ACCESS_TOKEN, process.env.AI_SUBSCRIPTION_KEY);
var getBotResponse = require('./botResponse');
var readlineSync   = require('readline-sync');

var bot = module.exports = function(message, callback) {
  var aiRequest = apiai.textRequest(message);

  aiRequest.on('response', function(aiResponse) {
    var botResponse = getBotResponse(aiResponse);
    callback(botResponse.message);
  });

  aiRequest.end();
};

if (!module.parent) {
  var query = readlineSync.question('Say something to wake the bot:\n');

  bot(query, callback);

  function callback(botResponse) {
    query = readlineSync.question(botResponse + '\n');
    bot(query, callback);
  }
}