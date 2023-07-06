'use strict'

const axios = require('axios');
const https = require('https');
const tap = require('tap');

const utils = require('../index.js');

tap.test('OpenHIM Authentication, Mediator Registration and Mediator Heartbeat', {autoend: true}, t => {
  t.test('Should authenticate and receive headers that allow API access to the OpenHIM - with old self cert option', t => {
    t.plan(1);

    utils.authenticate({
      apiURL: 'https://localhost:8080',
      username: 'root@openhim.org',
      rejectUnauthorized: false
    }, (_err, body) => {
      t.ok(body.ts);
    });
  });

  t.test('Should authenticate and receive headers that allow API access to the OpenHIM - with new self cert option', t => {
    t.plan(1);

    utils.authenticate({
      apiURL: 'https://localhost:8080',
      username: 'root@openhim.org',
      trustSelfSigned: true
    }, (_err, body) => {
      t.ok(body.ts);
    });
  });
  
  t.test('Mediator Registration', {autoend: true}, t => {
    const testConfig = (filename) => {
      const mediatorConfig = require(`./${filename}`);

      const openhimConfig = {
        username: "root@openhim.org",
        password: "instant101",
        apiURL: "https://localhost:8080",
        trustSelfSigned: true,
        urn: mediatorConfig.urn,
      };
    
      return { mediatorConfig, openhimConfig };
    }

    const DeleteMediator = async (config, mediatorConfig) => {
      const headers = {};
      headers.Authorization =
        "Basic " +
        Buffer.from(config.username + ":" + config.password).toString("base64");
    
      axios({
        url: `${config.apiURL}/mediators/${mediatorConfig.urn}`,
        httpsAgent: new https.Agent({rejectUnauthorized: false}),
        method: 'DELETE',
        headers
      });
    };

    t.test("Should return an error when attempting to register a mediator with invalid config", t => {
      t.plan(1);

      let { mediatorConfig, openhimConfig } = testConfig(
        "mediatorConfig-fail.json"
      );

      utils.registerMediator(
        openhimConfig,
        mediatorConfig,
        err => {
          t.equal(err.response.status, 400)
        }
      );
    });

    t.test("Should register a mediator", t => {
      t.plan(2);

      let { mediatorConfig, openhimConfig } = testConfig(
        "mediatorConfig.json"
      );

      utils.registerMediator(
        openhimConfig,
        mediatorConfig,
        err => {
          t.notOk(err);

          utils.fetchConfig(openhimConfig, (err) => {
            t.notOk(err);
            DeleteMediator(openhimConfig, mediatorConfig)
          })
        }
      );
    });
  })
});
