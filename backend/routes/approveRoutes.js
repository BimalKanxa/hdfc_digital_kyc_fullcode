const express = require("express");
const router = express.Router();

const { autoApprove } = require("../controllers/approveController");

router.post("/auto-approve", autoApprove);

module.exports = router;
