'use strict';

const https = require('https');
const axios = require('axios');

const auth = require('./auth');

exports.registerMediator = (options, mediatorConfig, callback) => {
  let rejectUnauthorized = !options.trustSelfSigned;
  
  // For backwards compatibility
  if (options.rejectUnauthorized === false) {
    rejectUnauthorized = false;
  }

  const headers = Object.assign({}, auth.genAuthHeaders(options), {'Content-Type': 'application/json'});

  const reqOptions = {
    url: `${options.apiURL}/mediators`,
    headers: headers,
    data: mediatorConfig,
    method: 'POST'
  };
  reqOptions.httpsAgent = new https.Agent({ rejectUnauthorized });

  axios(reqOptions).then(() => {
    callback();
  }).catch(err => {
    callback(err);
  });
};
