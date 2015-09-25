'use strict';

const request = require('request');
const utils = require('./auth');

exports.registerMediator = (options, mediatorConfig, callback) => {
  console.log(`Attempting to create/update mediator...`);

  // used to bypass self signed certificates
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // define login credentails for authorization
  const username = options.username;
  const password = options.password;
  const apiURL = options.apiURL;

  // authenticate the username
  utils.authenticate({username: username, apiURL: apiURL}, () => {
    let headers = utils.genAuthHeaders({username: username, password: password});

    // define request headers with auth credentails
    let reqOptions = {
      url: `${apiURL}/mediators`,
      json: true,
      headers: headers,
      body: mediatorConfig
    };

    // POST mediator to API for creation/update
    request.post(reqOptions, (err, resp) => {
      if (err){
        callback(err);
      }

      // check the response status from the API server
      if (resp.statusCode === 201) {
        // successfully created/updated
        callback();
      } else {
        callback(new Error(`Recieved a non-201 response code, the response body was: ${resp.body}`));
      }
    });
  });
};
