import fetch from "node-fetch";
import https from "https";
import fs from "fs";
import { resolve } from "path";
import { expect } from "chai";
import { afterEach } from "mocha";

import utils from "../index.js";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

describe("OpenHIM API Authentication", () => {
  it("Should authenticate and receive headers that allow API access to the OpenHIM", (done) => {
    utils.authenticate(
      {
        apiURL: "https://localhost:8080",
        username: "root@openhim.org",
        rejectUnauthorized: false,
      },
      async (err, body) => {
        try {
          expect(err).to.be.null;
          expect(!!body).to.eql(true);
        } catch (err) {
          return done(err);
        }

        const authHeaders = utils.genAuthHeaders({
          username: "root@openhim.org",
          password: "instant101",
        });

        try {
          const res = await fetch("https://localhost:8080/channels", {
            headers: authHeaders,
            method: "GET",
            agent: httpsAgent,
          });

          expect(res.status).to.be.eql(200);
          expect(!!res.body).to.eql(true);

          done();
        } catch (error) {
          return done(error);
        }
      }
    );
  });

  it("Should authenticate and receive headers that allow API access to the OpenHIM - with old self cert option", (done) => {
    utils.authenticate(
      {
        apiURL: "https://localhost:8080",
        username: "root@openhim.org",
        rejectUnauthorized: false,
      },
      async (err, body) => {
        try {
          expect(err).to.be.null;
          expect(!!body).to.eql(true);
        } catch (err) {
          return done(err);
        }

        const authHeaders = utils.genAuthHeaders({
          username: "root@openhim.org",
          password: "incorrect",
        });

        try {
          const res = await fetch("https://localhost:8080/channels", {
            headers: authHeaders,
            method: "GET",
            agent: httpsAgent,
          });

          expect(res.status).to.eql(401);

          done();
        } catch (error) {
          return done(error);
        }
      }
    );
  });

  it("Should authenticate and receive headers that allow API access to the OpenHIM - with new self cert option", (done) => {
    utils.authenticate(
      {
        apiURL: "https://localhost:8080",
        username: "root@openhim.org",
        trustSelfSigned: true,
      },
      async (err, body) => {
        try {
          expect(err).to.be.null;
          expect(!!body).to.eql(true);
        } catch (err) {
          return done(err);
        }

        const authHeaders = utils.genAuthHeaders({
          username: "root@openhim.org",
          password: "incorrect",
        });

        try {
          const res = await fetch("https://localhost:8080/channels", {
            headers: authHeaders,
            method: "GET",
            agent: httpsAgent,
          });

          expect(res.status).to.eql(401);

          done();
        } catch (error) {
          return done(error);
        }
      }
    );
  });
});

const testConfig = (filename) => {
  let mediatorConfig;
  try {
    const mediatorConfigFile = fs.readFileSync(resolve("tests", filename));

    mediatorConfig = JSON.parse(mediatorConfigFile.toString());
  } catch (error) {
    return error;
  }

  const openhimConfig = {
    username: "root@openhim.org",
    password: "instant101",
    apiURL: "https://localhost:8080",
    trustSelfSigned: true,
    urn: mediatorConfig.urn,
  };

  return { mediatorConfig, openhimConfig };
};

describe("Mediator Registration", () => {
  let { mediatorConfig, openhimConfig } = testConfig("mediatorConfig.json");

  afterEach(async () => {
    utils.deactivateHeartbeat();

    await DeleteMediator(openhimConfig, mediatorConfig);
  });

  it("Should return an error when attempting to register a mediator with invalid config", async () => {
    let { mediatorConfig, openhimConfig } = testConfig(
      "mediatorConfig-fail.json"
    );

    let receivedValue;
    await utils.registerMediator(
      openhimConfig,
      mediatorConfig,
      (returnedValue) => (receivedValue = returnedValue)
    );

    expect(receivedValue.message).to.eql(
      "Recieved a non-201 response code, the response body was: Could not add Mediator via the API: ValidationError: name: Path `name` is required."
    );
  });

  it("Should return an error from unauthorized activation of the heartbeat", async () => {
    let { mediatorConfig, openhimConfig } = testConfig("mediatorConfig.json");

    let callbackValue = "";
    await utils.registerMediator(openhimConfig, mediatorConfig, async () => {
      await utils.fetchConfig(openhimConfig, async (cVal) => {
        openhimConfig.trustSelfSigned = false;
        try {
          await utils.activateHeartbeat(openhimConfig);
        } catch (error) {
          callbackValue = error;
        }
      });
    });

    expect(
      JSON.stringify(callbackValue).includes("DEPTH_ZERO_SELF_SIGNED_CERT")
    ).to.eql(true);
    expect(await checkRegistered(openhimConfig, mediatorConfig)).to.eql(null);
  });

  it("Should return an error from unauthorized authenticationfrom fetchConfig()", async () => {
    let { mediatorConfig, openhimConfig } = testConfig("mediatorConfig.json");

    let callbackValue = "";
    await utils.registerMediator(openhimConfig, mediatorConfig, async () => {
      openhimConfig.trustSelfSigned = false;
      await utils.fetchConfig(openhimConfig, async (cVal) => {
        callbackValue = cVal;
      });

      expect(
        `${callbackValue}`.match(
          "FetchError: request to https://localhost:8080/authenticate/root@openhim.org failed, reason: self signed certificate"
        ).length
      ).to.eql(1);
    });
  });

  it("Should register a mediator and activate the heartbeat", async () => {
    let { mediatorConfig, openhimConfig } = testConfig("mediatorConfig.json");

    let callbackValue;
    await utils.registerMediator(openhimConfig, mediatorConfig, async () => {
      await utils.fetchConfig(openhimConfig, async (cVal) => {
        callbackValue = cVal;
        const emitter = await utils.activateHeartbeat(openhimConfig);
        emitter.on("error", (err) => {});
      });
    });

    expect(callbackValue).to.eql(null);
    expect(await checkRegistered(openhimConfig, mediatorConfig)).to.eql(null);
  });
});

const checkRegistered = async (config, mediatorConfig) => {
  let headers = {};
  headers.Authorization =
    "Basic " +
    Buffer.from(config.username + ":" + config.password).toString("base64");

  let response;
  response = await fetch(config.apiURL + "/mediators", {
    agent: httpsAgent,
    method: "GET",
    headers: headers,
  });

  const respBody = JSON.parse(await response.text());

  expect(respBody.length).to.be.eql(1);
  expect(respBody[0].name).be.eql(mediatorConfig.name);
  expect(JSON.stringify(respBody).includes("_lastHeartbeat")).to.eql(true);
  expect(JSON.stringify(respBody).includes("_uptime")).to.eql(true);

  return null;
};

const DeleteMediator = async (config, mediatorConfig) => {
  let headers = {};
  headers.Authorization =
    "Basic " +
    Buffer.from(config.username + ":" + config.password).toString("base64");

  await fetch(config.apiURL + `/mediators/` + mediatorConfig.urn, {
    agent: httpsAgent,
    headers,
    method: "DELETE",
  });
};
