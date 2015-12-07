var axios = require('axios');
var Menu  = require('../model/Menu');

var NLP_URL = 'http://localhost:3000';

module.exports.refreshUserEntities = async function(sessionId){
  var menu = await Menu.find({businessId: sessionId}).exec();
  var food = menu.map(function(item) {return {id: item.name, synonyms: item.synonyms.concat(item.name)};});
  return await axios.post(`${NLP_URL}/userEntities/${sessionId}`, {food: food});
};

module.exports.query = async function(message, sessionId){
  var res = await axios.get(`${NLP_URL}/query/${sessionId}?message=${message}`);
  return res.data;
};