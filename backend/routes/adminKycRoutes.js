const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

const { getAllKycs } = require("../controllers/adminKycController");
const { getSingleKyc } = require("../controllers/adminKycController");
const { approveKyc } = require("../controllers/adminKycController");
const { rejectKyc } = require("../controllers/adminKycController");

router.get("/admin/kycs", adminAuth, getAllKycs);
router.get("/admin/kycs/:kycId", adminAuth, getSingleKyc);
router.post("/admin/kycs/:kycId/approve", adminAuth, approveKyc);
router.post("/admin/kycs/:kycId/reject", adminAuth, rejectKyc);




module.exports = router;
