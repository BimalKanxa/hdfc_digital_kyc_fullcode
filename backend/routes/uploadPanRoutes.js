const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const { uploadPan } = require("../controllers/uploadPanController");

router.post("/upload-pan", upload.single("document"), uploadPan);

module.exports = router;
