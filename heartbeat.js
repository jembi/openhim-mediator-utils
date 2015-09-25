'use strict';

const request = require('request');
const auth = require('./auth');

const events = require('events');
const emitter = new events.EventEmitter();
let timer;

function sendHeartbeat(options) {
  let reqOptions = {
    url: `${options.apiURL}/mediators/${options.urn}/heartbeat`,
    headers: auth.genAuthHeaders(options),
    body: {uptime: process.uptime()},
    json: true
  };
  request.post(reqOptions, (err, res, body) => {
    if (err) {
      console.log(err.stack);
    }
    if (res.statusCode !== 200) {
      console.log(`Heartbeat unsuccessful, recieved status code of ${res.statusCode}`);
    }
    if (body && body !== 'OK') {
      emitter.emit('config', body);
    }
  });
}

exports.activateHeartbeat = (options, interval) => {
  interval = interval || 10000;

  auth.authenticate({apiURL: options.apiURL, username: options.username}, () => {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => {
      sendHeartbeat(options);
    }, interval);
  });

  return emitter;
};

exports.deactivateHearbeat = () => {
  clearInterval(timer);
};
