"use strict";

import fs from "fs";
import https from "https";
import fetch from "node-fetch";
import path from "path";

(async function () {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const authHeader = new Buffer.from(
    "root@openhim.org:openhim-password"
  ).toString("base64");

  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

  const jsonData = JSON.parse(
    fs.readFileSync(path.resolve(path.dirname("."), "openhim-import.json"))
  );

  const data = JSON.stringify(jsonData);

  try {
    const res = await fetch(`https://localhost:8080/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        Authorization: `Basic ${authHeader}`,
      },
      agent: httpsAgent,
      body: data,
    });

    if (res.status == 401) {
      throw new Error(`Incorrect OpenHIM API credentials`);
    }

    if (res.status != 201) {
      throw new Error(`Failed to import OpenHIM config: ${res.statusText}`);
    }
  } catch (error) {
    console.error(`Failed to import OpenHIM config: ${error}`);
  }
})();
