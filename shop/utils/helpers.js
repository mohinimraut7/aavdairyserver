const mongoose = require("mongoose");

// Wrap async controllers so thrown errors become consistent JSON responses.
const ah = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError")
      return res.status(400).json({ success: false, message: err.message });
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "value";
      return res.status(409).json({ success: false, message: `That ${field} is already in use` });
    }
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("[shop]", err);
    res.status(500).json({ success: false, message: "Something went wrong on the server" });
  }
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v) && String(new mongoose.Types.ObjectId(v)) === String(v);

const normalizePhone = (v) => String(v || "").replace(/\D/g, "").slice(-10);

const calcDelivery = (subtotal, settings) =>
  subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;

const isServiceable = (pincode, settings) =>
  /^\d{6}$/.test(String(pincode)) &&
  (!settings.serviceablePincodePrefixes?.length || settings.serviceablePincodePrefixes.some((p) => String(pincode).startsWith(p)));

module.exports = { ah, httpError, isObjectId, normalizePhone, calcDelivery, isServiceable };
