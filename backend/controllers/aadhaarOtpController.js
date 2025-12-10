const KycRequest = require("../models/KycRequest");
const { generateOtp, hashOtp } = require("../utils/otp");
const redis = require("../config/redis");
const twilioClient = require("../config/twilioClient");

const OTP_TTL = parseInt(process.env.OTP_TTL_SECONDS || "300"); // 5 minutes
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "3");

exports.sendAadhaarOtp = async (req, res) => { 
  try { 
    // kyc-id in header (as you requested earlier)
    const kycId = req.headers["kyc-id"] || req.headers["x-kyc-id"];
    if (!kycId) return res.status(400).json({ message: "Missing KYC ID in header" });

    // require phone in body (or fetch from user)
    const { phone } = req.body; // you can omit if user phone already in User doc

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) return res.status(404).json({ message: "KYC request not found" });

    // Check that aadhaar upload exists
    if (!kyc.aadhaar || !kyc.aadhaar.documentUrl) {
      return res.status(400).json({ message: "Aadhaar not uploaded yet" });
    }

    // Generate OTP
    const otp = generateOtp(6);
    const hashed = hashOtp(otp);

    const redisKey = `aadhaar:otp:${kycId}`;
    const redisAttemptsKey = `aadhaar:otp:attempts:${kycId}`;

    // Reset attempts to 0 when sending new OTP
    await redis.set(redisAttemptsKey, 0, "EX", OTP_TTL);

    // Save hashed OTP to redis with TTL
    await redis.set(redisKey, hashed, "EX", OTP_TTL);

    // Save otpSentAt in KycRequest (optional)
    kyc.aadhaar.otpSentAt = new Date();
    kyc.aadhaar.otpAttempts = 0;
    kyc.updatedAt = new Date();
    await kyc.save();

    // Send via Twilio if configured
    if (twilioClient) {
      const from = process.env.TWILIO_FROM;
      const to = phone || (await fetchUserPhone(kyc.userId)); // create helper if needed
      if (!to) {
        // Can't send SMS -> return OTP in response in dev mode (but don't in prod)
        console.log("No phone available; OTP:", otp);
      } else {
        await twilioClient.messages.create({
          body: `Your OTP for Aadhaar verification is ${otp}. It will expire in ${OTP_TTL/60} minutes.`,
          from,
          to
        });
      }
    } else {
      // SIMULATION mode: log OTP to server logs (safe for dev)
      console.log(`SIMULATED OTP for KYC ${kycId} => ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent (or simulated).",
      expiresIn: OTP_TTL
    });

  } catch (error) {
    console.error("sendAadhaarOtp error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

// helper to fetch user's phone from DB if phone not passed in request
async function fetchUserPhone(userId) {
  const User = require("../models/User");
  const user = await User.findById(userId);
  return user ? user.phone : null;
}
