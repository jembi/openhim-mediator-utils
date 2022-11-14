"use strict";

import fs from "fs";
import https from "https";
import fetch from "node-fetch";
import path from "path";

const authHeader = new Buffer.from(
  "root@openhim.org:openhim-password"
).toString("base64");

const jsonData = JSON.parse(
  fs.readFileSync(path.resolve(path.dirname("."), "openhim-import.json"))
);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const data = JSON.stringify(jsonData);

console.log("===================================");
console.log(`data = ${data}`);

const options = {
  protocol: "https:",
  hostname: "localhost",
  port: 8080,
  path: "/metadata",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
    Authorization: `Basic ${authHeader}`,
  },
};

// const httpsAgent = new https.Agent({
//   rejectUnauthorized: false,
// });

// const reqs = fetch(`https://127.0.0.1:8080/heartbeat`, {
//   method: "GET",
//   headers: {
//     "Content-Type": "application/json",
//     "Content-Length": data.length,
//     Authorization: `Basic ${authHeader}`,
//   },
//   agent: httpsAgent,
// });

const req = https.request(options, (res) => {
  if (res.statusCode == 401) {
    throw new Error(`Incorrect OpenHIM API credentials`);
  }

  if (res.statusCode != 201) {
    throw new Error(`Failed to import OpenHIM config: ${res.statusCode}`);
  }

  console.log("Successfully Imported OpenHIM Config");
});

req.on("error", (error) => {
  console.error("Failed to import OpenHIM config: ", error);
});

req.write(data);
req.end();
