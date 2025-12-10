const KycRequest = require("../models/KycRequest");
const User = require("../models/User");

exports.autoApprove = async (req, res) => {
  try {
    const kycId = req.headers["x-kyc-id"];

    if (!kycId) {
      return res.status(400).json({ message: "Missing KYC ID in headers" });
    }

    const kyc = await KycRequest.findById(kycId);

    if (!kyc) {
      return res.status(404).json({ message: "KYC ID not found" });
    }

    // Cannot approve rejected KYC
    if (kyc.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve — KYC already rejected",
      });
    }
    // Cannot approve already approved KYC
    if (kyc.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Invalid Request — KYC already approved",
      });
    }

    // Must pass face match stage
    if (kyc.stage !== "FACE_MATCH") {
      return res.status(400).json({
        success: false,
        message: "KYC not ready for approval — face match missing",
      });
    }

    // OCR must extract key fields
    if (!kyc.extractedData || !kyc.extractedData.idNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing document details — OCR extraction incomplete",
      });
    } 

    // APPROVE
    kyc.status = "APPROVED";
    kyc.stage = "COMPLETED";
    kyc.updatedAt = new Date();
    await kyc.save();

        // 🔥 Update user profile status
    const user = await User.findById(kyc.userId);
    if (user) {
      user.profileStatus = "KYC_COMPLETED";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "KYC auto-approved successfully",
      kycId: kyc._id,
      status: kyc.status
    });

  } catch (error) {
    console.error("Auto Approve Error:", error);
    res.status(500).json({
      success: false,
      message: "Auto approval failed",
      error: error.message
    });
  }
};
