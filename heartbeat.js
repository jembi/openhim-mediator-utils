'use strict';

const request = require('request');
const auth = require('./auth');

const events = require('events');
const emitter = new events.EventEmitter();
let timer;

function sendHeartbeat(options, forceConfig, callback) {
  const reqOptions = {
    url: `${options.apiURL}/mediators/${options.urn}/heartbeat`,
    headers: auth.genAuthHeaders(options),
    body: {uptime: process.uptime()},
    json: true,
    rejectUnauthorized: !options.trustSelfSigned
  };
  if (forceConfig === true) {
    reqOptions.body.config = true;
  }
  request.post(reqOptions, (err, res, body) => {
    if (err) {
      if (callback) {
        return callback(err);
      } else {
        return emitter.emit('error', err);
      }
    }
    if (res.statusCode !== 200) {
      const error = new Error(`Heartbeat unsuccessful, recieved status code of ${res.statusCode}`);
      if (callback) {
        return callback(error);
      } else {
        return emitter.emit('error', error);
      }
    }
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
  });
}

exports.activateHeartbeat = (options, interval) => {
  interval = interval || 10000;

  auth.authenticate({apiURL: options.apiURL, username: options.username, rejectUnauthorized: !options.trustSelfSigned}, (err) => {
    if (err) {
      return emitter.emit('error', err);
    }
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => {
      sendHeartbeat(options);
    }, interval);
  });

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
  auth.authenticate({apiURL: options.apiURL, username: options.username, rejectUnauthorized: !options.trustSelfSigned}, (err) => {
    if (err) {
      return callback(err);
    }
    sendHeartbeat(options, true, callback);
  });
};
