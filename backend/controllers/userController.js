
const User = require("../models/User");
const KycRequest = require("../models/KycRequest");

exports.createUser = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // 1️⃣ Check if user already exists
    let user = await User.findOne({ phone });

    if (user) {
      // Check if KYC already exists for that user
      let existingKyc = await KycRequest.findOne({ userId: user._id });
      console.log("kyc is", existingKyc)

      return res.status(200).json({
        success: true,
        message: "User already exists",
        userId: user._id,
        kycId: existingKyc?._id || null,
        kycStage: existingKyc?.stage || null,
        kycStatus: existingKyc?.status || null,
      });
    }


    // 2️⃣ Create new user if not exists
    user = await User.create({
      name,
      phone,
      email,
      profileStatus: "KYC_PENDING"
    });

    // 3️⃣ Create a fresh KYC session for this user
    const kyc = await KycRequest.create({
      userId: user._id,
      stage: "AADHAAR_UPLOAD",
      status: "PENDING",

      // Initialize empty KYC structure
      aadhaar: {
        documentUrl: "",
        extractedData: {},
        ocrVerified: false,
        otpVerified: false,
        attempts: 0
      },
      pan: {
        documentUrl: "",
        extractedData: {},
        ocrVerified: false,
        attempts: 0
      },
      faceMatch: {
        selfieUrl: "",
        score: null,
        verified: false,
        attempts: 0
      }
    });

    return res.status(201).json({
      success: true,
      message: "User created and KYC session started",
      userId: user._id,
      kycId: kyc._id,
      user
    });

  } catch (error) {
    console.error("Create User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message
    });
  }
};
