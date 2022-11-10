"use strict";

import utils from "./index";
import fetch from "node-fetch";
import https from "https";

export const registerMediator = async (options, mediatorConfig, callback) => {
  // define login credentails for authorization
  const username = options.username;
  const password = options.password;
  const apiURL = options.apiURL;
  const rejectUnauthorized = !options.trustSelfSigned;

  // authenticate the username
  await utils.authenticate(
    { username, apiURL, rejectUnauthorized },
    async (err) => {
      if (err) {
        return callback(err);
      }
      const headers = utils.appendHeader(
        utils.genAuthHeaders({ username, password }),
        {
          key: "Content-Type",
          value: "application/json",
        }
      );

      // define request headers with auth credentails
      const reqOptions = {
        url: `${apiURL}/mediators`,
        json: true,
        headers: headers,
        body: mediatorConfig,
        rejectUnauthorized: rejectUnauthorized,
      };

      const httpsAgent = new https.Agent({
        rejectUnauthorized: reqOptions.rejectUnauthorized,
      });

      try {
        const res = await fetch(reqOptions.url, {
          method: "POST",
          headers: headers,
          agent: httpsAgent,
          body: JSON.stringify(mediatorConfig),
          redirect: "follow",
        });

        if (res.status === 201) {
          callback();
        } else {
          callback(
            new Error(
              `Recieved a non-201 response code, the response body was: ${await res.text()}`
            )
          );
        }
      } catch (error) {
        callback(error);
      }
    }
  );
};
