'use strict';

const auth = require('./auth');
const register = require('./register');
const heartbeat = require('./heartbeat');

exports.authenticate = auth.authenticate;
exports.genAuthHeaders = auth.genAuthHeaders;
exports.registerMediator = register.registerMediator;
exports.activateHeartbeat = heartbeat.activateHeartbeat;
exports.deactivateHearbeat = heartbeat.deactivateHearbeat;
exports.fetchConfig = heartbeat.fetchConfig;
