// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const protect = async (req, res, next) => {
//   try {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ success: false, message: "Not authorized, no token" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || !user.isActive) {
//       return res.status(401).json({ success: false, message: "Not authorized, user not found" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ success: false, message: "Not authorized, token failed" });
//   }
// };

// const authorize = (...roles) => (req, res, next) => {
//   if (!req.user || !roles.includes(req.user.role)) {
//     return res.status(403).json({ success: false, message: "Not authorized for this action" });
//   }
//   next();
// };

// module.exports = { protect, authorize };




const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { can } = require("../config/permissions");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    // Farm (admin panel) APIs are for staff only. Customers use /api/shop.
    if (user.role === "customer" && !req.allowCustomer) {
      return res.status(403).json({ success: false, message: "Customer accounts cannot access the farm admin panel" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized for this action" });
  }
  next();
};

// permit("medical", "create") -> checks the matrix in config/permissions.js
const permit = (module, action) => (req, res, next) => {
  if (!req.user || !can(req.user.role, module, action)) {
    return res.status(403).json({
      success: false,
      message: `Your role (${req.user?.role || "unknown"}) is not allowed to ${action} ${module}`,
    });
  }
  next();
};

// Same as protect, but also accepts customer accounts (used by GET /api/auth/me).
const protectAny = (req, res, next) => {
  req.allowCustomer = true;
  return protect(req, res, next);
};

module.exports = { protect, protectAny, authorize, permit };