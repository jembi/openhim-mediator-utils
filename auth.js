'use strict';

const axios = require('axios');
const https = require('https');

exports.authenticate = (options, callback) => {
  // authenticate the username
  let reqOptions = {
    url: `${options.apiURL}/authenticate/${options.username}`,
    rejectUnauthorized: !options.trustSelfSigned
  };
  // continue to support old option name for backwards compatibility
  if (options.rejectUnauthorized == false) {
    reqOptions.rejectUnauthorized = false;
  }

  reqOptions.httpsAgent = new https.Agent({
    rejectUnauthorized: reqOptions.rejectUnauthorized
  });

  axios(reqOptions).then(response => {
    callback(null, response.data);
  }).catch(error => {
    callback(error);
  });
};

exports.genAuthHeaders = (options) => {
  const authHeader = new Buffer.from(
    `${options.username}:${options.password}`
  ).toString('base64');

  return {
    Authorization: `Basic ${authHeader}`
  };
};
