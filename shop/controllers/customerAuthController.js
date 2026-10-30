const { toPublicCustomer } = require("../middlewares/customerAuth");
const { ah, httpError } = require("../utils/helpers");

// Register / login are handled by the common /api/auth endpoints (role "customer").

exports.me = ah(async (req, res) => res.json({ success: true, data: toPublicCustomer(req.customer) }));

exports.updateMe = ah(async (req, res) => {
  const c = req.customer;
  if (req.body.name !== undefined) c.name = String(req.body.name).trim();
  if (req.body.email !== undefined) c.email = String(req.body.email).trim().toLowerCase() || undefined;
  await c.save();
  res.json({ success: true, message: "Profile updated", data: toPublicCustomer(c) });
});

exports.addAddress = ah(async (req, res) => {
  const c = req.customer;
  const { label, line1, area, city, state, pincode, isDefault } = req.body;
  if (c.addresses.length >= 10) throw httpError(400, "You can save up to 10 addresses");
  const makeDefault = Boolean(isDefault) || c.addresses.length === 0;
  if (makeDefault) c.addresses.forEach((a) => (a.isDefault = false));
  c.addresses.push({ label, line1, area, city, state, pincode, isDefault: makeDefault });
  await c.save();
  res.status(201).json({ success: true, data: c.addresses });
});

exports.deleteAddress = ah(async (req, res) => {
  const c = req.customer;
  c.addresses = c.addresses.filter((a) => String(a._id) !== req.params.id);
  if (c.addresses.length && !c.addresses.some((a) => a.isDefault)) c.addresses[0].isDefault = true;
  await c.save();
  res.json({ success: true, data: c.addresses });
});
