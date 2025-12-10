const KycRequest = require("../models/KycRequest");
const User = require("../models/User");

exports.getKycDetails = async (req, res) => {
  try {
    const { kycId } = req.params;

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required",
      });
    }

    // Find KYC and populate user info
    const kyc = await KycRequest.findById(kycId).populate("userId", "name phone email profileStatus");

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    return res.status(200).json({
      success: true,
      kyc,
    });

  } catch (error) {
    console.error("Get KYC Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching KYC details",
      error: error.message,
    });
  }
};
