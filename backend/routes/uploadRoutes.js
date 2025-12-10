const express = require("express");
const router = express.Router();

const multer = require("../middleware/multer");
const { uploadDocument } = require("../controllers/uploadController");

router.post("/upload-document", multer.single("document"), uploadDocument);

module.exports = router;
