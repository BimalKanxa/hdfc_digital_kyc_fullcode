const express = require("express");
const router = express.Router();
const { sendAadhaarOtp } = require("../controllers/aadhaarOtpController");
const { verifyAadhaarOtp } = require("../controllers/aadhaarVerifyController");

router.post("/aadhaar/send-otp", sendAadhaarOtp);
router.post("/aadhaar/verify-otp", verifyAadhaarOtp);

module.exports = router;
