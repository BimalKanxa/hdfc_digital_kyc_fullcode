// const KycRequest = require("../models/KycRequest");

// exports.uploadAadhaar = async (req, res) => {
//   try {
//     const kycId = req.headers["x-kyc-id"];

//     if (!kycId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing KYC ID in header"
//       });
//     }

//     const { documentUrl } = req.body;

//     if (!documentUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing documentUrl"
//       });
//     }

//     // Get the KYC session
//     const kyc = await KycRequest.findById(kycId);

//     if (!kyc) {
//       return res.status(404).json({
//         success: false,
//         message: "KYC record not found"
//       });
//     }

//     // Update Aadhaar document details
//     kyc.aadhaar.documentUrl = documentUrl;
//     kyc.aadhaar.ocrVerified = false;
//     kyc.aadhaar.otpVerified = false;

//     // Reset attempts when a new document is uploaded
//     kyc.aadhaar.attempts = 0;
//     kyc.stage = "AADHAAR_OCR";
//     kyc.updatedAt = new Date();

//     await kyc.save();

//     return res.status(200).json({
//       success: true,
//       message: "Aadhaar uploaded successfully",
//       stage: kyc.stage,
//       aadhaarUrl: documentUrl
//     });

//   } catch (error) {
//     console.error("Upload Aadhaar Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal error while uploading Aadhaar",
//       error: error.message
//     });
//   }
// };


// const cloudinary = require("../config/cloudinary");
// const KycRequest = require("../models/KycRequest");

// exports.uploadAadhaar = async (req, res) => {
//   try {
//     const kycId = req.headers["x-kyc-id"];

//     if (!kycId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing KYC ID"
//       });
//     }

//     const kyc = await KycRequest.findById(kycId);
//     if (!kyc) {
//       return res.status(404).json({
//         success: false,
//         message: "KYC record not found"
//       });
//     }

//     // No file?
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No file provided"
//       });
//     }

//     // Convert file buffer → base64
//     const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
//       "base64"
//     )}`;

//     // Upload to Cloudinary
//     const uploadRes = await cloudinary.uploader.upload(fileBase64, {
//       folder: "digital-kyc/aadhaar"
//     });

//     const documentUrl = uploadRes.secure_url;

//     // Update Aadhaar fields in KYC
//     kyc.aadhaar.documentUrl = documentUrl;
//     kyc.aadhaar.ocrVerified = false;
//     kyc.aadhaar.otpVerified = false;

//     // Reset Aadhaar attempts
//     kyc.aadhaar.attempts = 0;

//     // Move process to next stage
//     kyc.stage = "AADHAAR_OCR";
//     kyc.updatedAt = new Date();

//     await kyc.save();

//     return res.status(200).json({
//       success: true,
//       message: "Aadhaar uploaded successfully",
//       fileUrl: documentUrl,
//       stage: kyc.stage
//     });

//   } catch (error) {
//     console.error("Aadhaar Upload Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to upload Aadhaar",
//       error: error.message
//     });
//   }
// };



const cloudinary = require("../config/cloudinary");
const KycRequest = require("../models/KycRequest");
const Tesseract = require("tesseract.js");
const { hashDocumentNumber } = require("../utils/hash");

// Extract Aadhaar fields
const extractAadhaarFields = (text) => {
  let name = "";
  let dob = "";
  let aadhaarNumber = "";

  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
  const dobRegex = /\b(\d{2}[-/]\d{2}[-/]\d{4})\b/;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Name extraction — first line with letters
  for (let line of lines) {
    if (/[A-Za-z]{3,}/.test(line) && line.length > 3) {
      name = line;
      break;
    }
  }

  if (aadhaarRegex.test(text)) {
    aadhaarNumber = text.match(aadhaarRegex)[0];
  }

  if (dobRegex.test(text)) {
    dob = text.match(dobRegex)[0];
  }

  return { name, dob, aadhaarNumber };
};

exports.uploadAadhaar = async (req, res) => {
  try {
    const kycId = req.headers["x-kyc-id"];

    if (!kycId) {
      return res.status(400).json({ success: false, message: "Missing KYC ID" });
    }

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC record not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    // Convert file to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: "digital-kyc/aadhaar"
    });

    const documentUrl = uploadRes.secure_url;

    // Save raw document URL
    kyc.aadhaar.documentUrl = documentUrl;

    // 🧠 Step 2: RUN OCR IMMEDIATELY
    const ocrResult = await Tesseract.recognize(documentUrl, "eng");
    const text = ocrResult.data.text;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "OCR failed — no text detected" });
    }

    // Extract Aadhaar fields
    const extracted = extractAadhaarFields(text);

    if (!extracted.aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "Failed to detect Aadhaar number — please upload a clearer image"
      });
    }

    // Duplicate detection using hash
    const docHash = hashDocumentNumber(extracted.aadhaarNumber);
    const duplicate = await KycRequest.findOne({ "aadhaar.documentHash": docHash });

    if (duplicate) {
      kyc.status = "REJECTED";
      kyc.failureReason = "Duplicate Aadhaar detected";
      await kyc.save();

      return res.status(409).json({
        success: false,
        message: "Duplicate Aadhaar detected",
        duplicate: true
      });
    }

    // Save extracted OCR data
    kyc.aadhaar.extractedData = extracted;
    kyc.aadhaar.documentHash = docHash;

    kyc.aadhaar.ocrVerified = true;
    kyc.aadhaar.attempts += 1;

    // Move to next stage
    kyc.stage = "AADHAAR_OTP";
    kyc.updatedAt = new Date();

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: "Aadhaar uploaded & OCR completed",
      fileUrl: documentUrl,
      extractedData: extracted,
      nextStage: "AADHAAR_OTP"
    });

  } catch (error) {
    console.error("Aadhaar Upload + OCR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload & process Aadhaar",
      error: error.message
    });
  }
};
