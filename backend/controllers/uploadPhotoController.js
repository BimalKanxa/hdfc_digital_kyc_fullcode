const cloudinary = require("../config/cloudinary");
const KycRequest = require("../models/KycRequest");

exports.uploadPassportPhoto = async (req, res) => {
  try {
    const kycId = req.headers["x-kyc-id"] || req.headers["kyc-id"];
    if (!kycId) return res.status(400).json({ success: false, message: "Missing KYC ID in header" });

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    // Optionally validate image dimensions (passport-size) with sharp or client-side checks
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: "digital-kyc/passport-photos"
    });

    const documentUrl = uploadRes.secure_url;

    // Update KYC photo field
    kyc.photo.documentUrl = documentUrl;
    kyc.photo.uploaded = true;
    kyc.photo.attempts = (kyc.photo.attempts || 0) + 1;
    kyc.photo.uploadedAt = new Date();

    // Next stage is Face Match
    kyc.stage = "FACE_MATCH";
    kyc.updatedAt = new Date();

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: "Passport-size photo uploaded successfully",
      fileUrl: documentUrl,
      nextStage: kyc.stage
    });

  } catch (error) {
    console.error("uploadPassportPhoto Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload passport photo",
      error: error.message
    });
  }
};
