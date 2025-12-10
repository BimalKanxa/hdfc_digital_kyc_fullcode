const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
let client = null;

if (accountSid && authToken) {
  const twilio = require("twilio");
  client = twilio(accountSid, authToken);
}

module.exports = client;
