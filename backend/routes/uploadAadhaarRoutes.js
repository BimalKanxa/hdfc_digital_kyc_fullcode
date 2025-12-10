const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // memory storage

const { uploadAadhaar } = require("../controllers/uploadAadhaarController");

router.post("/upload-aadhaar", upload.single("document"), uploadAadhaar);

module.exports = router;
