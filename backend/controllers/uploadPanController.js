const cloudinary = require("../config/cloudinary");
const KycRequest = require("../models/KycRequest");
const Tesseract = require("tesseract.js");
const { hashDocumentNumber } = require("../utils/hash");

// Extract PAN fields
const extractPanFields = (text) => {
  let name = "";
  let panNumber = "";
  let dob = "";

  const panRegex = /[A-Z]{5}\d{4}[A-Z]{1}/;
  const dobRegex = /\b(\d{2}[\/-]\d{2}[\/-]\d{4})\b/;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Find PAN number
  if (panRegex.test(text)) {
    panNumber = text.match(panRegex)[0];
  }

  // Find DOB
  if (dobRegex.test(text)) {
    dob = text.match(dobRegex)[0];
  }

  // First reasonable line = name
  for (let line of lines) {
    if (/^[A-Za-z\s]{3,}$/.test(line) && !line.match(panRegex) && !line.match(dobRegex)) {
      name = line;
      break;
    }
  }

  return { name, dob, panNumber };
};

exports.uploadPan = async (req, res) => {
  try {
    const kycId = req.headers["x-kyc-id"];
    if (!kycId) return res.status(400).json({ message: "Missing KYC ID" });

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PAN file provided" });
    }

    // Upload PAN file to Cloudinary
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: "digital-kyc/pan"
    });

    const documentUrl = uploadRes.secure_url;

    // Save PAN document URL
    kyc.pan.documentUrl = documentUrl;

    // 🔥 Run OCR
    const result = await Tesseract.recognize(documentUrl, "eng");
    const text = result.data.text;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "OCR failed — no text detected" });
    }

    // Extract PAN fields
    const extracted = extractPanFields(text);

    if (!extracted.panNumber) {
      return res.status(400).json({
        success: false,
        message: "PAN number could not be detected. Please upload a clearer image."
      });
    }

    // Duplicate PAN detection
    const hash = hashDocumentNumber(extracted.panNumber);
    const duplicate = await KycRequest.findOne({ "pan.documentHash": hash });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Duplicate PAN detected",
        duplicate: true
      });
    }

    // PAN ↔ Aadhaar DOB verification
    if (kyc.aadhaar.extractedData?.dob && extracted.dob) {
      if (kyc.aadhaar.extractedData.dob !== extracted.dob) {
        kyc.status = "REJECTED";
        kyc.failureReason = "PAN DOB does not match Aadhaar DOB";
        await kyc.save();

        return res.status(400).json({
          success: false,
          message: "DOB mismatch between Aadhaar & PAN",
          aadhaarDOB: kyc.aadhaar.extractedData.dob,
          panDOB: extracted.dob
        });
      }
    }

    // Update PAN data
    kyc.pan.extractedData = extracted;
    kyc.pan.documentHash = hash;
    kyc.pan.ocrVerified = true;
    kyc.pan.attempts += 1;

    // Move to FACE MATCH stage
    kyc.stage = "FACE_MATCH";
    kyc.updatedAt = new Date();

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: "PAN uploaded & OCR completed",
      fileUrl: documentUrl,
      extractedData: extracted,
      nextStage: "FACE_MATCH"
    });

  } catch (error) {
    console.error("PAN Upload + OCR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload & process PAN",
      error: error.message
    });
  }
};
