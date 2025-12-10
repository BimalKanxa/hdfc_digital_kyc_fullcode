// const mongoose = require("mongoose");

// const kycRequestSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
 
//   documentType: {
//     type: String,
//     enum: ["AADHAAR", "PAN", "PASSPORT", "VOTER_ID"],
//     required: true
//   },

//   documentUrl: { type: String },
//   selfieUrl: { type: String },

//   extractedData: {
//     name: String,
//     dob: String,
//     idNumber: String,
//     documentValidity: String
//   },

//   stage: {
//     type: String,
//     enum: [
//       "SELECT_DOCUMENT",
//       "SCAN_DOCUMENT",
//       "UPLOAD_DOCUMENT",
//       "OCR_CHECK",
//       "FACE_MATCH",
//       "KYC_APPROVAL",
//       "COMPLETED",
//       "REJECTED"
//     ],
//     default: "SELECT_DOCUMENT"
//   },

//   status: {
//     type: String,
//     enum: ["PENDING", "APPROVED", "REJECTED"],
//     default: "PENDING"
//   },

//   // 3 attempts allowed per stage
//   attempts: {
//     selectDocument: { type: Number, default: 0 },
//     scanDocument: { type: Number, default: 0 },
//     uploadDocument: { type: Number, default: 0 },
//     ocr: { type: Number, default: 0 },
//     faceMatch: { type: Number, default: 0 }
//   },

//   failureReason: { type: String },

//   // duplicate detection
//   documentHash: { type: String, index: true },  // hashed Aadhaar/PAN
//   idNumberMasked: String,                       // XXXX6789 type

//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("KycRequest", kycRequestSchema);




const mongoose = require("mongoose");

const kycRequestSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Aadhaar Section
  aadhaar: {
    documentUrl: String,
    extractedData: {
      name: String,
      dob: String,
      aadhaarNumber: String,
    },
    documentHash: String,    // for duplicate detection
    ocrVerified: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },  // optional
    attempts: { type: Number, default: 0 },
    otpSentAt: Date,
    otpAttempts: { type: Number, default: 0 },
    otpExpiresAt: Date,
    otpHash: String   // only if using Mongo fallback (not needed when using Redis)
  },

  // PAN Section
  pan: {
    documentUrl: String,
    extractedData: {
      name: String,
      panNumber: String,
      dob: String
    },
    documentHash: String,
    ocrVerified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 }
  },

  // inside kycRequestSchema (add these fields)
signature: {
  documentUrl: String,
  uploaded: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  uploadedAt: Date
},

photo: {
  documentUrl: String,
  uploaded: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  uploadedAt: Date
},


  // Face Match Section
  faceMatch: {
    selfieUrl: String,
    score: Number,
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 }
  },

  // Overall KYC Status
  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "APPROVED", "REJECTED"],
    default: "PENDING",
  },

  stage: {
    type: String,
    enum: [
      "AADHAAR_UPLOAD",
      "AADHAAR_OTP",
      "PAN_UPLOAD",
      "SIGNATURE_UPLOAD",
      "PHOTO_UPLOAD",
      "FACE_MATCH",
      "KYC_APPROVAL",
      "COMPLETED"
    ],
    default: "AADHAAR_UPLOAD"
  },

  failureReason: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("KycRequest", kycRequestSchema);
