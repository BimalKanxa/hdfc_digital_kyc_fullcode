const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const { uploadSelfie } = require("../controllers/uploadSelfieController");

router.post("/upload-selfie", upload.single("selfie"), uploadSelfie);

module.exports = router;
