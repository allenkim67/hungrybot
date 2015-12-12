var axios = require('axios');
var Menu  = require('../model/Menu');

var NLP_DOMAIN = process.env.NODE_ENV === 'production' ? 'http://hungry-nlp.herokuapp.com' : 'http://localhost:3000';

module.exports.refreshUserEntities = async function(sessionId){
  var menu = await Menu.find({businessId: sessionId}).exec();
  var food = menu.map(item => [item.name].concat(item.synonyms));
  return await axios.post(`${NLP_DOMAIN}/userEntities/${sessionId}`, {food: food});
};

module.exports.query = async function(message, sessionId){
  var res = await axios.get(`${NLP_DOMAIN}/query/${sessionId}?message=${message}`);
  return res.data;
};