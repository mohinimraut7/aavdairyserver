const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protectAny } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectAny, getMe);

module.exports = router;
