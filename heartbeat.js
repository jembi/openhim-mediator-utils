"use strict";

import request from "request";
import utils from "./index";

import events from "events";
const emitter = new events.EventEmitter();
let timer;

function sendHeartbeat(options, forceConfig, callback) {
  const reqOptions = {
    url: `${options.apiURL}/mediators/${options.urn}/heartbeat`,
    headers: utils.genAuthHeaders(options),
    body: { uptime: process.uptime() },
    json: true,
    rejectUnauthorized: !options.trustSelfSigned,
  };
  if (forceConfig === true) {
    reqOptions.body.config = true;
  }
  request.post(reqOptions, (err, res, body) => {
    if (err) {
      if (callback) {
        return callback(err);
      } else {
        return emitter.emit("error", err);
      }
    }
    if (res.statusCode !== 200) {
      const error = new Error(
        `Heartbeat unsuccessful, received status code of ${res.statusCode}`
      );
      if (callback) {
        return callback(error);
      } else {
        return emitter.emit("error", error);
      }
    }
    if (body && body !== "OK") {
      // if there is a callback use that else, emit as an event
      if (callback) {
        return callback(null, body);
      } else {
        return emitter.emit("config", body);
      }
    } else {
      // No config found
      if (callback) {
        return callback(null, {});
      }
    }
  });
}

export const activateHeartbeat = (options, interval) => {
  interval = interval || 10000;

  utils.authenticate(
    {
      apiURL: options.apiURL,
      username: options.username,
      rejectUnauthorized: !options.trustSelfSigned,
    },
    (err) => {
      if (err) {
        return emitter.emit("error", err);
      }
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => {
        sendHeartbeat(options);
      }, interval);
    }
  );

  return emitter;
};

// typo :( - leaving here for backwards compatibility
export const deactivateHearbeat = () => {
  clearInterval(timer);
};

export const deactivateHeartbeat = () => {
  clearInterval(timer);
};

export const fetchConfig = (options, callback) => {
  utils.authenticate(
    {
      apiURL: options.apiURL,
      username: options.username,
      rejectUnauthorized: !options.trustSelfSigned,
    },
    (err) => {
      if (err) {
        return callback(err);
      }
      sendHeartbeat(options, true, callback);
    }
  );
};
