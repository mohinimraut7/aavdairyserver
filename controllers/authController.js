const generateToken = require("../utils/generateToken");
const User = require("../models/User");

// POST /api/auth/register
// Body matches Register.jsx as-is: { farmName, username, password, confirmPassword }
const register = async (req, res) => {
  try {
    const { farmName, username, email, password, confirmPassword } = req.body;

    if (!password || (confirmPassword !== undefined && password !== confirmPassword)) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (!username && !email) {
      return res.status(400).json({ success: false, message: "username or email is required" });
    }

    const existing = await User.findOne({
      $or: [{ username: username || null }, { email: email || null }],
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with that username/email already exists" });
    }

    const user = await User.create({ farmName, username, email, password });

    res.status(201).json({
      success: true,
      message: "Farm registered successfully",
      data: {
        _id: user._id,
        farmName: user.farmName,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
// Body matches Login.jsx as-is: { email, password }. Accepts { username, password } too.
const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        farmName: user.farmName,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Current user fetched", data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
