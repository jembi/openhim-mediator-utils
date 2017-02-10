'use strict';

const crypto = require('crypto');
const request = require('request');

const authUserMap = new Map();

exports.authenticate = (options, callback) => {
  // authenticate the username
  let reqOptions = {
    url: `${options.apiURL}/authenticate/${options.username}`,
    rejectUnauthorized: options.rejectUnauthorized
  };
  
  request.get(reqOptions, (err, resp, body) => {
    if (err){
      callback(err);
      return;
    }
    // if user isnt found
    if (resp.statusCode !== 200) {
      callback(new Error(`User ${options.username} not found when authenticating with core API`));
      return;
    }
    try {
      body = JSON.parse(body);
      authUserMap.set(options.username, body.salt);
    } catch (err) {
      callback(err);
    }
    callback(null, body);
  });
};

exports.genAuthHeaders = (options) => {
  let salt = authUserMap.get(options.username);
  if (salt === undefined) {
    throw new Error(`${options.username} has not been authenticated. Please use the .authenticate() function first`);
  }

  let now = new Date();

  // create passhash
  let shasum = crypto.createHash('sha512');
  shasum.update(salt + options.password);
  let passhash = shasum.digest('hex');

  // create token
  shasum = crypto.createHash('sha512');
  shasum.update(passhash + salt + now);
  let token = shasum.digest('hex');

  // define request headers with auth credentails
  return {
    'auth-username': options.username,
    'auth-ts': now,
    'auth-salt': salt,
    'auth-token': token
  };
};
