const KycRequest = require("../models/KycRequest");
const { hashOtp } = require("../utils/otp");
const redis = require("../config/redis");

const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "3");

exports.verifyAadhaarOtp = async (req, res) => {
  try {
    const kycId = req.headers["kyc-id"] || req.headers["x-kyc-id"];
    if (!kycId) return res.status(400).json({ message: "Missing KYC ID in header" });

    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP required" });

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) return res.status(404).json({ message: "KYC request not found" });

    const redisKey = `aadhaar:otp:${kycId}`;
    const redisAttemptsKey = `aadhaar:otp:attempts:${kycId}`;

    const storedHash = await redis.get(redisKey);
    if (!storedHash) {
      return res.status(400).json({ message: "OTP expired or not found. Please request a new OTP." });
    }

    // increment attempts
    const attempts = parseInt((await redis.get(redisAttemptsKey)) || 0) + 1;
    await redis.set(redisAttemptsKey, attempts, "EX", parseInt(process.env.OTP_TTL_SECONDS || "300"));

    if (attempts > OTP_MAX_ATTEMPTS) {
      // optionally reject KYC or lock Aadhaar attempts
      kyc.aadhaar.attempts = (kyc.aadhaar.attempts || 0) + 1;
      if (kyc.aadhaar.attempts >= 3) {
        kyc.status = "REJECTED";
        kyc.failureReason = "Aadhaar OTP attempts exceeded";
      }
      await kyc.save();
      await redis.del(redisKey);
      await redis.del(redisAttemptsKey);
      return res.status(400).json({ message: "Max OTP attempts exceeded. Aadhaar verification failed." });
    }

    const hashedProvided = hashOtp(otp);

    if (hashedProvided !== storedHash) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP valid -> mark aadhaar.otpVerified = true
    kyc.aadhaar.otpVerified = true;
    kyc.aadhaar.otpVerifiedAt = new Date();
    kyc.stage = "PAN_UPLOAD"; // move to next stage automatically
    kyc.updatedAt = new Date();
    await kyc.save();

    // cleanup redis
    await redis.del(redisKey);
    await redis.del(redisAttemptsKey);

    return res.status(200).json({ success: true, message: "Aadhaar OTP verified" });

  } catch (error) {
    console.error("verifyAadhaarOtp error:", error);
    return res.status(500).json({ success: false, message: "OTP verify failed", error: error.message });
  }
};
