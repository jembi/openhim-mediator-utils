'use strict';

const https = require('https');
const axios = require('axios');
const events = require('events');

const auth = require('./auth');

const emitter = new events.EventEmitter();
let timer;

function sendHeartbeat(options, forceConfig, callback) {
  let rejectUnauthorized = !options.trustSelfSigned;
  const headers = Object.assign({}, auth.genAuthHeaders(options), {'Content-Type': 'application/json'});

  // For backwards compatibilty
  if (options.rejectUnauthorized === false) {
    rejectUnauthorized = false;
  }

  const reqOptions = {
    url: `${options.apiURL}/mediators/${options.urn}/heartbeat`,
    headers: headers,
    data: {uptime: process.uptime()},
    method: 'POST'
  };
  reqOptions.httpsAgent = new https.Agent({ rejectUnauthorized });

  if (forceConfig === true) {
    reqOptions.data.config = true;
  }

  axios(reqOptions).then(response => {
    const body = response.data;

    if (body && body !== 'OK') {
      // if there is a callback use that else, emit as an event
      if (callback) {
        return callback(null, body);
      } else {
        return emitter.emit('config', body);
      }
    } else {
      // No config found
      if (callback) {
        return callback(null, {});
      }
    }
  }).catch(err => {
    if (err) {
      if (callback) {
        return callback(err);
      } else {
        return emitter.emit('error', err);
      }
    }
  });
}

exports.activateHeartbeat = (options, interval) => {
  interval = interval || 10000;

  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    sendHeartbeat(options);
  }, interval);

  return emitter;
};

// typo :( - leaving here for backwards compatibility
exports.deactivateHearbeat = () => {
  clearInterval(timer);
};

exports.deactivateHeartbeat = () => {
  clearInterval(timer);
};

exports.fetchConfig = (options, callback) => {
  sendHeartbeat(options, true, callback);
};
