var axios = require('axios');

module.exports.createUserEntity = function(data){
  var config = {
    headers: {
      "Authorization": "Bearer " + process.env.AI_DEV_ACCESS_TOKEN,
      "ocp-apim-subscription-key": process.env.AI_SUBSCRIPTION_KEY
    }
  };
  return axios.post("https://api.api.ai/v1/userEntities?v=20150910", data, config);
};

module.exports.query = function(message, sessionId){
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
  return axios.get("https://api.api.ai/v1/query?v=20150910", config).then(function(response){
    return response.data
  });
};