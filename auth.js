"use strict";

import crypto from "crypto";
import fetch from "node-fetch";
import https from "https";

const authUserMap = new Map();

export const authenticate = async (options, callback) => {
  // authenticate the username
  let reqOptions = {
    url: `${options.apiURL}/authenticate/${options.username}`,
    rejectUnauthorized: !options.trustSelfSigned,
  };
  // continue to support old option name for backwards compatibility
  if (options.rejectUnauthorized == false) {
    reqOptions.rejectUnauthorized = false;
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: reqOptions.rejectUnauthorized,
  });

  try {
    const res = await fetch(reqOptions.url, {
      method: "GET",
      agent: httpsAgent,
    });

    if (res.status !== 200) {
      callback(
        new Error(
          `User ${options.username} not found when authenticating with core API`
        )
      );
      return;
    }

    const body = JSON.parse(JSON.stringify(await res.json()));

    authUserMap.set(options.username, body.salt);

    callback(null, body);
  } catch (error) {
    callback(error);
    return;
  }
};

export const genAuthHeaders = (options) => {
  const salt = authUserMap.get(options.username);
  if (salt === undefined) {
    throw new Error(
      `${options.username} has not been authenticated. Please use the .authenticate() function first`
    );
  }

  const now = new Date().toISOString();

  // create passhash
  let shasum = crypto.createHash("sha512");
  shasum.update(salt + options.password);
  const passhash = shasum.digest("hex");

  // create token
  shasum = crypto.createHash("sha512");
  shasum.update(passhash + salt + now);
  const token = shasum.digest("hex");

  // define request headers with auth credentails
  return {
    "auth-username": options.username,
    "auth-ts": now,
    "auth-salt": salt,
    "auth-token": token,
  };
};
