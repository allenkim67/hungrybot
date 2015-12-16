var s3 = require('s3');
var path = require('path');

var client = s3.createClient({
  s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

module.exports.upload = function(localFile, key) {
  var params = {
    localFile: localFile,

    s3Params: {
      Bucket: 'hungrybot',
      Key: key
    }
  };

  var uploader = client.uploadFile(params);
};

