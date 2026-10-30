const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// Customers log in through the common /api/auth/login (role "customer") and get the
// same kind of JWT as staff. Store endpoints only accept tokens whose user is a customer.
const readCustomer = async (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user && user.isActive && user.role === "customer" ? user : null;
  } catch {
    return null;
  }
};

// Public shape used by the website (keeps `phone` for the storefront UI).
const toPublicCustomer = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  mobileNumber: u.mobileNumber,
  phone: u.mobileNumber,
  role: u.role,
  addresses: u.addresses,
  createdAt: u.createdAt,
});

const protectCustomer = async (req, res, next) => {
  const customer = await readCustomer(req);
  if (!customer) return res.status(401).json({ success: false, message: "Please log in with a customer account to continue" });
  req.customer = customer;
  next();
};

// Guest checkout: attach the customer when a valid customer token is present, otherwise continue.
const optionalCustomer = async (req, res, next) => {
  req.customer = await readCustomer(req);
  next();
};

module.exports = { protectCustomer, optionalCustomer, toPublicCustomer };
