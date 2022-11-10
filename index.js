"use strict";

import { authenticate, genAuthHeaders, appendHeader } from "./auth";
import { registerMediator } from "./register";
import {
  activateHeartbeat,
  deactivateHearbeat,
  deactivateHeartbeat,
  fetchConfig,
} from "./heartbeat";

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
