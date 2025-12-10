const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // memory storage

const { uploadSignature } = require("../controllers/uploadSignatureController");
const { uploadPassportPhoto } = require("../controllers/uploadPhotoController");

// POST /api/upload-signature
router.post("/upload-signature", upload.single("document"), uploadSignature);

// POST /api/upload-photo
router.post("/upload-photo", upload.single("document"), uploadPassportPhoto);

module.exports = router;
    