/* global describe, it, expect */
const utils = require('../index.js');
const request = require('request');

describe('OpenHIM API Authentication', () => {
  it('Should authenticate and receive headers that allow API access to the OpenHIM', done => {
    utils.authenticate({
      apiURL: 'https://localhost:8080',
      username: 'root@openhim.org',
      rejectUnauthorized: false
    }, (err, body) => {
      try {
        expect(err).toBeNull();
        expect(body).toBeTruthy();
        expect(body.salt).toBeTruthy();
        expect(body.ts).toBeTruthy();
      } catch (err) {
        return done(err);
      }
      
      const authHeaders = utils.genAuthHeaders({username: 'root@openhim.org', password: 'openhim-password'});
    
      const reqOptions = {
        url: `https://localhost:8080/channels`,
        headers: authHeaders,
        json: true,
        rejectUnauthorized: false
      };
      request.get(reqOptions, (err, res, body) => {
        try {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(200);
          expect(body).toBeTruthy();
        } catch (err) {
          return done(err);
        }

        done();
      });
    });
  });

  it('Should authenticate and receive headers that allow API access to the OpenHIM - with old self cert option', done => {
    utils.authenticate({
      apiURL: 'https://localhost:8080',
      username: 'root@openhim.org',
      rejectUnauthorized: false
    }, (err, body) => {
      try {
        expect(err).toBeNull();
        expect(body).toBeTruthy();
        expect(body.salt).toBeTruthy();
        expect(body.ts).toBeTruthy();
      } catch (err) {
        return done(err);
      }
      
      const authHeaders = utils.genAuthHeaders({username: 'root@openhim.org', password: 'incorrect'});
    
      const reqOptions = {
        url: `https://localhost:8080/channels`,
        headers: authHeaders,
        json: true,
        rejectUnauthorized: false
      };
      request.get(reqOptions, (err, res) => {
        try {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(401);
        } catch (err) {
          return done(err);
        }

        done();
      });
    });
  });

  it('Should authenticate and receive headers that allow API access to the OpenHIM - with new self cert option', done => {
    utils.authenticate({
      apiURL: 'https://localhost:8080',
      username: 'root@openhim.org',
      trustSelfSigned: true
    }, (err, body) => {
      try {
        expect(err).toBeNull();
        expect(body).toBeTruthy();
        expect(body.salt).toBeTruthy();
        expect(body.ts).toBeTruthy();
      } catch (err) {
        return done(err);
      }
      
      const authHeaders = utils.genAuthHeaders({username: 'root@openhim.org', password: 'incorrect'});
    
      const reqOptions = {
        url: `https://localhost:8080/channels`,
        headers: authHeaders,
        json: true,
        rejectUnauthorized: false
      };
      request.get(reqOptions, (err, res) => {
        try {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(401);
        } catch (err) {
          return done(err);
        }

        done();
      });
    });
  });
});
