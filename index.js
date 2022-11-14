"use strict";

import { authenticate, genAuthHeaders, appendHeader } from "./auth.js";
import { registerMediator } from "./register.js";
import {
  activateHeartbeat,
  deactivateHearbeat,
  deactivateHeartbeat,
  fetchConfig,
} from "./heartbeat.js";

export default {
  authenticate: authenticate,
  genAuthHeaders: genAuthHeaders,
  registerMediator: registerMediator,
  activateHeartbeat: activateHeartbeat,
  deactivateHearbeat: deactivateHearbeat,
  deactivateHeartbeat: deactivateHeartbeat,
  fetchConfig: fetchConfig,
  appendHeader: appendHeader,
};
