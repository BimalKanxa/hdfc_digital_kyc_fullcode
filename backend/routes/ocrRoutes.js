const express = require("express");
const router = express.Router();
const { processOCR } = require("../controllers/ocrController");

router.post("/ocr-extract", processOCR);

module.exports = router;
