const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");

router.post("/create-user", createUser);

module.exports = router;
