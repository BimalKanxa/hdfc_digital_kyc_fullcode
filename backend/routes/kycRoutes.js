const express = require("express");
const router = express.Router();
const { createKyc } = require("../controllers/kycController");

router.post("/create-kyc", createKyc);

module.exports = router;
