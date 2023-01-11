"use strict";

import utils from "./index.js";
import fetch from "node-fetch";
import https from "https";

import events from "events";
const emitter = new events.EventEmitter();
let timer;

async function sendHeartbeat(options, forceConfig, callback) {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: !options.trustSelfSigned,
  });

  const headers = utils.appendHeader(utils.genAuthHeaders(options), {
    key: "Content-Type",
    value: "application/json",
  });

  const body = { uptime: process.uptime() };
  if (forceConfig === true) {
    body.config = true;
  }

  const reqOptions = {
    method: "POST",
    headers: headers,
    agent: httpsAgent,
    body: JSON.stringify(body),
  };

  try {
    const url = `${options.apiURL}/mediators/${options.urn}/heartbeat`;
    const res = await fetch(url, reqOptions);

    if (res.status !== 200) {
      const error = new Error(
        `Heartbeat unsuccessful, received ${res.status} ${res.statusText}`
      );
      if (callback) {
        return callback(error);
      } else {
        return emitter.emit("error", error);
      }
    }

    const resBody = await res.text();

    if (resBody && resBody !== "OK") {
      // if there is a callback use that else, emit as an event
      if (callback) {
        return callback(null, resBody);
      } else {
        return emitter.emit("config", resBody);
      }
    } else {
      // No config found
      if (callback) {
        await callback(null);
      }
    }
  } catch (error) {
    if (callback) {
      return callback(new Error(`Heartbeat unsuccessful: ${error}`));
    } else {
      return emitter.emit("error", error);
    }
  }
}

export const activateHeartbeat = async (options, interval) => {
  interval = interval || 10000;

  await utils.authenticate(
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
      timer = setInterval(async () => {
        await sendHeartbeat(options);
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

export const fetchConfig = async (options, callback) => {
  await utils.authenticate(
    {
      apiURL: options.apiURL,
      username: options.username,
      rejectUnauthorized: !options.trustSelfSigned,
    },
    async (err) => {
      if (err) {
        return callback(err);
      }
      await sendHeartbeat(options, true, callback);
    }
  );
};
