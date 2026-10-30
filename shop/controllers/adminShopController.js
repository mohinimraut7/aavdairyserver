const Order = require("../models/Order");
const User = require("../../models/User");
const ShopProduct = require("../models/ShopProduct");
const ShopSettings = require("../models/ShopSettings");
const ContactMessage = require("../models/ContactMessage");
const { ah } = require("../utils/helpers");

// GET /api/shop/admin/dashboard
exports.dashboard = ah(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [byStatus, today, revenue, customers, lowStock, recent] = await Promise.all([
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.aggregate([{ $match: { orderStatus: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    User.countDocuments({ role: "customer" }),
    ShopProduct.find({ isActive: true, stockQuantity: { $lte: 5 } }).select("name packageSize stockQuantity").lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).select("orderNumber contact totalAmount orderStatus paymentStatus createdAt").lean(),
  ]);
  res.json({
    success: true,
    data: {
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      ordersToday: today,
      revenue: revenue[0]?.total || 0,
      customers,
      lowStock,
      recentOrders: recent,
    },
  });
});

exports.customers = ah(async (req, res) => {
  const data = await User.find({ role: "customer" }).select("name email mobileNumber addresses isActive createdAt").sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, count: data.length, data });
});

exports.getSettings = ah(async (req, res) => res.json({ success: true, data: await ShopSettings.get() }));

exports.updateSettings = ah(async (req, res) => {
  const s = await ShopSettings.get();
  ["freeDeliveryThreshold", "deliveryFee", "codEnabled", "serviceablePincodePrefixes", "deliverySlots"].forEach((k) => {
    if (req.body[k] !== undefined) s[k] = req.body[k];
  });
  await s.save();
  res.json({ success: true, message: "Settings saved", data: s });
});

exports.messages = ah(async (req, res) => {
  const data = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, count: data.length, data });
});
