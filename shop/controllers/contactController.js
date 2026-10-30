const ContactMessage = require("../models/ContactMessage");
const { ah, httpError, normalizePhone } = require("../utils/helpers");

exports.sendMessage = ah(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  const message = String(req.body.message || "").trim();
  if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || message.length < 5)
    throw httpError(400, "Please enter your name, a valid mobile number and a message");
  await ContactMessage.create({ name, phone, email: req.body.email, message: message.slice(0, 2000) });
  res.status(201).json({ success: true, message: "Message received" });
});
