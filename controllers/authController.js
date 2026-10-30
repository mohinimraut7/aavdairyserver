// // const generateToken = require("../utils/generateToken");
// // const User = require("../models/User");

// // // POST /api/auth/register
// // // Body matches Register.jsx as-is: { farmName, username, password, confirmPassword }
// // const register = async (req, res) => {
// //   try {
// //     const { farmName, username, email, password, confirmPassword } = req.body;

// //     if (!password || (confirmPassword !== undefined && password !== confirmPassword)) {
// //       return res.status(400).json({ success: false, message: "Passwords do not match" });
// //     }
// //     if (!username && !email) {
// //       return res.status(400).json({ success: false, message: "username or email is required" });
// //     }

// //     const existing = await User.findOne({
// //       $or: [{ username: username || null }, { email: email || null }],
// //     });
// //     if (existing) {
// //       return res.status(409).json({ success: false, message: "An account with that username/email already exists" });
// //     }

// //     const user = await User.create({ farmName, username, email, password });

// //     res.status(201).json({
// //       success: true,
// //       message: "Farm registered successfully",
// //       data: {
// //         _id: user._id,
// //         farmName: user.farmName,
// //         username: user.username,
// //         email: user.email,
// //         role: user.role,
// //         token: generateToken(user._id, user.role),
// //       },
// //     });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // POST /api/auth/login
// // // Body matches Login.jsx as-is: { email, password }. Accepts { username, password } too.
// // const login = async (req, res) => {
// //   try {
// //     const { email, username, password } = req.body;
// //     const identifier = email || username;

// //     if (!identifier || !password) {
// //       return res.status(400).json({ success: false, message: "Email/username and password are required" });
// //     }

// //     const user = await User.findOne({
// //       $or: [{ email: identifier }, { username: identifier }],
// //     }).select("+password");

// //     if (!user || !(await user.matchPassword(password))) {
// //       return res.status(401).json({ success: false, message: "Invalid credentials" });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: "Login successful",
// //       data: {
// //         _id: user._id,
// //         farmName: user.farmName,
// //         username: user.username,
// //         email: user.email,
// //         role: user.role,
// //         token: generateToken(user._id, user.role),
// //       },
// //     });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // GET /api/auth/me
// // const getMe = async (req, res) => {
// //   try {
// //     res.status(200).json({ success: true, message: "Current user fetched", data: req.user });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // module.exports = { register, login, getMe };




// const generateToken = require("../utils/generateToken");
// const User = require("../models/User");

// // POST /api/auth/register
// // Body matches Register.jsx as-is: { farmName, username, password, confirmPassword }
// const register = async (req, res) => {
//   try {
//     const { farmName, username, email, password, confirmPassword } = req.body;

//     if (!password || (confirmPassword !== undefined && password !== confirmPassword)) {
//       return res.status(400).json({ success: false, message: "Passwords do not match" });
//     }
//     if (!username && !email) {
//       return res.status(400).json({ success: false, message: "username or email is required" });
//     }

//     // Only check fields that were actually provided —
//     // avoids matching { email: null } against every account missing an email
//     const orConditions = [];
//     if (username) orConditions.push({ username });
//     if (email) orConditions.push({ email });

//     const existing = orConditions.length
//       ? await User.findOne({ $or: orConditions })
//       : null;

//     if (existing) {
//       return res.status(409).json({ success: false, message: "An account with that username/email already exists" });
//     }

//     const user = await User.create({ farmName, username, email, password });

//     res.status(201).json({
//       success: true,
//       message: "Farm registered successfully",
//       data: {
//         _id: user._id,
//         farmName: user.farmName,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // POST /api/auth/login
// // Body matches Login.jsx as-is: { email, password }. Accepts { username, password } too.
// const login = async (req, res) => {
//   try {
//     const { email, username, password } = req.body;
//     const identifier = email || username;

//     if (!identifier || !password) {
//       return res.status(400).json({ success: false, message: "Email/username and password are required" });
//     }

//     const user = await User.findOne({
//       $or: [{ email: identifier }, { username: identifier }],
//     }).select("+password");

//     if (!user || !(await user.matchPassword(password))) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         _id: user._id,
//         farmName: user.farmName,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET /api/auth/me
// const getMe = async (req, res) => {
//   try {
//     res.status(200).json({ success: true, message: "Current user fetched", data: req.user });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// module.exports = { register, login, getMe };






// const generateToken = require("../utils/generateToken");
// const User = require("../models/User");

// // POST /api/auth/register
// // Body matches Register.jsx as-is: { farmName, username, password, confirmPassword }
// const register = async (req, res) => {
//   try {
//     const { farmName, username, email, password, confirmPassword } = req.body;

//     if (!password || (confirmPassword !== undefined && password !== confirmPassword)) {
//       return res.status(400).json({ success: false, message: "Passwords do not match" });
//     }
//     if (!username && !email) {
//       return res.status(400).json({ success: false, message: "username or email is required" });
//     }

//     const existing = await User.findOne({
//       $or: [{ username: username || null }, { email: email || null }],
//     });
//     if (existing) {
//       return res.status(409).json({ success: false, message: "An account with that username/email already exists" });
//     }

//     const user = await User.create({ farmName, username, email, password });

//     res.status(201).json({
//       success: true,
//       message: "Farm registered successfully",
//       data: {
//         _id: user._id,
//         farmName: user.farmName,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // POST /api/auth/login
// // Body matches Login.jsx as-is: { email, password }. Accepts { username, password } too.
// const login = async (req, res) => {
//   try {
//     const { email, username, password } = req.body;
//     const identifier = email || username;

//     if (!identifier || !password) {
//       return res.status(400).json({ success: false, message: "Email/username and password are required" });
//     }

//     const user = await User.findOne({
//       $or: [{ email: identifier }, { username: identifier }],
//     }).select("+password");

//     if (!user || !(await user.matchPassword(password))) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         _id: user._id,
//         farmName: user.farmName,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET /api/auth/me
// const getMe = async (req, res) => {
//   try {
//     res.status(200).json({ success: true, message: "Current user fetched", data: req.user });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// module.exports = { register, login, getMe };




const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const { ROLES, ALL_ROLES, CUSTOMER_ROLE, SELF_REGISTER_ROLES } = require("../config/permissions");

// Usernames/emails are always stored lower-case; trim + lowercase every input
// so "Doctor1", "doctor1 " and "DOCTOR1" all mean the same account.
const normalize = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v) || undefined;

// Case-insensitive exact match - also finds old accounts saved before lowercasing.
const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exactCI = (v) => new RegExp(`^${escapeRegex(v)}$`, "i");

// Keep only the last 10 digits ("+91 98765 43210" -> "9876543210").
const normalizeMobile = (v) => String(v || "").replace(/\D/g, "").slice(-10);

// Shape returned by register/login. The frontend stores this as avv_user and
// decides where to go: role "customer" -> online store, staff roles -> admin panel.
const userPayload = (user) => ({
  _id: user._id,
  farmName: user.farmName,
  username: user.username,
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role,
  token: generateToken(user._id, user.role),
});

// POST /api/auth/register
// Staff:    { role: "Doctor" | "Caretaker" | "Administrator", username, password, confirmPassword, farmName? }
// Customer: { role: "customer", name, email?, mobileNumber, password, confirmPassword? }
const registerCustomer = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalize(req.body.email);
  const mobileNumber = normalizeMobile(req.body.mobileNumber);
  const { password, confirmPassword } = req.body;

  if (name.length < 2) return res.status(400).json({ success: false, message: "Please enter your full name" });
  if (!/^[6-9]\d{9}$/.test(mobileNumber))
    return res.status(400).json({ success: false, message: "Enter a valid 10-digit mobile number" });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return res.status(400).json({ success: false, message: "Enter a valid email address" });
  if (!password || password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  if (confirmPassword !== undefined && password !== confirmPassword)
    return res.status(400).json({ success: false, message: "Passwords do not match" });

  const or = [{ mobileNumber }];
  if (email) or.push({ email: exactCI(email) });
  const existing = await User.findOne({ $or: or });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: existing.mobileNumber === mobileNumber
        ? "An account with this mobile number already exists"
        : "An account with this email already exists",
    });
  }

  const user = await User.create({ name, email, mobileNumber, password, role: CUSTOMER_ROLE });
  return res.status(201).json({ success: true, message: "Registered successfully as customer", data: userPayload(user) });
};

const register = async (req, res) => {
  try {
    const roleInput = normalize(req.body.role) || "";
    if (roleInput === CUSTOMER_ROLE) return await registerCustomer(req, res);

    const { farmName, password, confirmPassword } = req.body;
    const username = normalize(req.body.username);
    const email = normalize(req.body.email);

    if (!password || (confirmPassword !== undefined && password !== confirmPassword)) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (!username && !email) {
      return res.status(400).json({ success: false, message: "username or email is required" });
    }

    // Duplicate check (case-insensitive). Only include fields actually sent.
    const orConditions = [];
    if (username) orConditions.push({ username: exactCI(username) });
    if (email) orConditions.push({ email: exactCI(email) });
    const existing = orConditions.length ? await User.findOne({ $or: orConditions }) : null;
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with that username/email already exists" });
    }

    // Role is required. Match case-insensitively so "doctor" -> "Doctor".
    const role = ALL_ROLES.find((r) => r.toLowerCase() === roleInput);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: `Please select a valid role (${[...ALL_ROLES, CUSTOMER_ROLE].join(", ")})`,
      });
    }

    // Administrator can only be self-registered while the farm has no Administrator yet.
    if (!SELF_REGISTER_ROLES.includes(role)) {
      const adminExists = await User.exists({ role: ROLES.ADMIN });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: "An Administrator already exists. Please register as Doctor or Caretaker.",
        });
      }
    }

    const user = await User.create({ farmName, username, email, password, role });
    res.status(201).json({ success: true, message: `Registered successfully as ${user.role}`, data: userPayload(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with these details already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
// Body: { username | email | mobileNumber, password } — the single login field on the
// Login page may hold a username, an email or a 10-digit mobile number.
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const identifier = normalize(req.body.email) || normalize(req.body.username) || normalize(req.body.mobileNumber);

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Username/email/mobile and password are required" });
    }

    const or = [{ email: exactCI(identifier) }, { username: exactCI(identifier) }];
    const mobile = normalizeMobile(identifier);
    if (/^[6-9]\d{9}$/.test(mobile) && /^[\d\s+()-]+$/.test(identifier)) or.push({ mobileNumber: mobile });

    const user = await User.findOne({ $or: or }).select("+password");

    if (!user || !user.isActive || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({ success: true, message: "Login successful", data: userPayload(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me   (staff and customers)
const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Current user fetched", data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
