const KycRequest = require("../models/KycRequest");

exports.createKyc = async (req, res) => {
  try {
    const { userId, documentType, documentUrl } = req.body;

    if (!userId || !documentType || !documentUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const kyc = await KycRequest.create({
      userId,
      documentType,
      documentUrl,
      stage: "UPLOAD_DOCUMENT",
      status: "PENDING"
    });

    return res.status(201).json({
      success: true,
      message: "KYC request created",
      kycId: kyc._id,
      kyc
    });

  } catch (error) {
    console.error("Create KYC Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create KYC request",
      error: error.message
    });
  }
};
