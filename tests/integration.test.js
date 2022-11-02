import fetch from "node-fetch";
import https from "https";

import utils from "../index";

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
          expect(err).toBeNull();
          expect(body).toBeTruthy();
          expect(body.salt).toBeTruthy();
          expect(body.ts).toBeTruthy();
        } catch (err) {
          return done(err);
        }

        const authHeaders = utils.genAuthHeaders({
          username: "root@openhim.org",
          password: "openhim-password",
        });

        try {
          const res = await fetch("https://localhost:8080/channels", {
            headers: authHeaders,
            method: "GET",
            agent: httpsAgent,
          });

          expect(res.status).toBe(200);
          expect(res.body).toBeTruthy();

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
          expect(err).toBeNull();
          expect(body).toBeTruthy();
          expect(body.salt).toBeTruthy();
          expect(body.ts).toBeTruthy();
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

          expect(res.status).toBe(401);

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
          expect(err).toBeNull();
          expect(body).toBeTruthy();
          expect(body.salt).toBeTruthy();
          expect(body.ts).toBeTruthy();
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

          expect(res.status).toBe(401);

          done();
        } catch (error) {
          return done(error);
        }
      }
    );
  });
});
