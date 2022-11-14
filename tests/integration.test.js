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
          expect(!!body.salt).to.eql(true);
          expect(!!body.ts).to.eql(true);
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
          expect(!!body.salt).to.eql(true);
          expect(!!body.ts).to.eql(true);
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
          expect(!!body.salt).to.eql(true);
          expect(!!body.ts).to.eql(true);
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
