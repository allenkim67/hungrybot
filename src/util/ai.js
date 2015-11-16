var axios    = require('axios');
var throttle = require('./throttle');
var Menu     = require('../model/Menu');

module.exports.createUserEntity = async function(data){
  var config = {
    headers: {
      "Authorization": "Bearer " + process.env.AI_DEV_ACCESS_TOKEN,
      "ocp-apim-subscription-key": process.env.AI_SUBSCRIPTION_KEY
    },
    params: {
      sessionId: data.sessionId
    }
  };
  var userEntities = await axios.get(`https://api.api.ai/v1/userEntities/${data.name}?v=20150910`, config);
  if (userEntities.data.status && userEntities.data.status.errorType === 'not_found') {
    return await axios.post("https://api.api.ai/v1/userEntities?v=20150910", data, config);
  } else {
    return await axios.put(`https://api.api.ai/v1/userEntities/${data.name}?v=20150910`, data, config);
  }
};

module.exports.query = function(message, sessionId, {refresh = true}){
  if (refresh) refreshMenuEntitiesThrottled(sessionId);

  var config = {
    headers: {
      "Authorization": "Bearer " + process.env.AI_CLIENT_ACCESS_TOKEN,
      "ocp-apim-subscription-key": process.env.AI_SUBSCRIPTION_KEY
    },
    params: {
      query: message,
      sessionId: sessionId,
      lang: "en"
    }
  };

  return axios.get("https://api.api.ai/v1/query?v=20150910", config)
    .then(function(response){
      return response.data
    })
    .catch(function(err) { console.log(err); });
};

var refreshMenuEntities = async function(businessId) {
  var menu = await Menu.find({businessId: businessId}).exec();
  var userEntity = {
    sessionId: businessId.toString(),
    name: "food",
    extend: false,
    entries: menu.map(function(menuItem) {
      return {
        value: menuItem.name,
        synonyms: [menuItem.name]
      }
    })
  };
  return await ai.createUserEntity(userEntity);
};

var refreshMenuEntitiesThrottled = throttle(refreshMenuEntities, 1800000);