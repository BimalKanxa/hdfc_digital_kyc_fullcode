const express = require("express");
const router = express.Router();

const { getKycDetails } = require("../controllers/getKycController");

router.get("/get-kyc/:kycId", getKycDetails);

module.exports = router;
