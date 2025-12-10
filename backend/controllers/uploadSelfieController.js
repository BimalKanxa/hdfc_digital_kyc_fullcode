const cloudinary = require("../config/cloudinary");
const KycRequest = require("../models/KycRequest");
const { CompareFacesCommand } = require("@aws-sdk/client-rekognition");
const fetch = require("node-fetch");
const rekognition = require("../config/awsRekognition");

// Convert URL → Buffer
async function fetchImageBuffer(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}

// MAIN MERGED SELFIE + FACE MATCH
exports.uploadSelfie = async (req, res) => {
  try {
    const kycId = req.headers["x-kyc-id"];
    if (!kycId) return res.status(400).json({ success: false, message: "Missing KYC ID" });

    const kyc = await KycRequest.findById(kycId);
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });

    // SELFIE IS REQUIRED
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No selfie provided" });
    }

    // Upload selfie to Cloudinary
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: "digital-kyc/selfie"
    });

    const selfieUrl = uploadRes.secure_url;

    // Save raw selfie URL
    kyc.faceMatch.selfieUrl = selfieUrl;

    // 🔥 FACE MATCH STARTS HERE
    const documentUrl =
      kyc.aadhaar.documentUrl || kyc.pan.documentUrl;

    if (!documentUrl) {
      return res.status(400).json({
        success: false,
        message: "No Aadhaar/PAN document available for face matching"
      });
    }

    const sourceImage = await fetchImageBuffer(documentUrl); // Aadhaar/PAN image
    const targetImage = await fetchImageBuffer(selfieUrl);   // Selfie

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: sourceImage },
      TargetImage: { Bytes: targetImage },
      SimilarityThreshold: 60
    });

    const result = await rekognition.send(command);

    let matchScore = 0;
    let passed = false;

    if (result.FaceMatches && result.FaceMatches.length > 0) {
      matchScore = result.FaceMatches[0].Similarity;
      passed = matchScore >= 60;
    }

    // Update KYC face match details
    kyc.faceMatch.score = matchScore;
    kyc.faceMatch.verified = passed;
    kyc.faceMatch.attempts += 1;
    kyc.updatedAt = new Date();

    if (!passed) {
      kyc.status = "REJECTED";
      kyc.failureReason = "Face mismatch";

      await kyc.save();

      return res.status(400).json({
        success: false,
        message: "Face mismatch",
        score: matchScore
      });
    }

    // If passed → KYC ready for auto-approval
    kyc.stage = "KYC_APPROVAL";

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: "Selfie uploaded & face matched",
      selfieUrl,
      score: matchScore,
      nextStage: "KYC_APPROVAL"
    });

  } catch (error) {
    console.error("Selfie + Face Match Error:", error);
    return res.status(500).json({
      success: false,
      message: "Selfie upload + face match failed",
      error: error.message
    });
  }
};
