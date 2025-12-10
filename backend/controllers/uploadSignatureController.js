const cloudinary = require("../config/cloudinary");
const KycRequest = require("../models/KycRequest");

exports.uploadSignature = async (req, res) => {
  try {
    const kycId = req.headers["x-kyc-id"] || req.headers["kyc-id"];
    if (!kycId) return res.status(400).json({ success: false, message: "Missing KYC ID in header" });

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    // Limit file size/type optionally here
    // Convert buffer -> base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary under signature folder
    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: "digital-kyc/signatures"
    });

    const documentUrl = uploadRes.secure_url;

    // Update KYC signature field
    kyc.signature.documentUrl = documentUrl;
    kyc.signature.uploaded = true;
    kyc.signature.attempts = (kyc.signature.attempts || 0) + 1;
    kyc.signature.uploadedAt = new Date();

    // Decide next stage:
    // After signature upload we want passport-photo upload next (per your requested flow)
    kyc.stage = "PHOTO_UPLOAD"; // or "PHOTO_UPLOAD" (passport-size upload)
    kyc.updatedAt = new Date();

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: "Signature uploaded successfully",
      fileUrl: documentUrl,
      nextStage: kyc.stage
    });

  } catch (error) {
    console.error("uploadSignature Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload signature",
      error: error.message
    });
  }
};
