const crypto = require("crypto");
const Order = require("../models/Order");
const ShopProduct = require("../models/ShopProduct");
const ShopSettings = require("../models/ShopSettings");
const { ORDER_STATUSES } = require("../models/Order");
const { ah, httpError, isObjectId, normalizePhone, calcDelivery, isServiceable } = require("../utils/helpers");
const { isConfigured } = require("../utils/razorpay");

const newOrderNumber = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `AAV${ymd}${crypto.randomInt(1000, 9999)}`;
};

const restoreStock = (items) =>
  Promise.all(items.map((i) => ShopProduct.updateOne({ _id: i.product }, { $inc: { stockQuantity: i.quantity, soldCount: -i.quantity } })));

// POST /api/shop/orders  — guest or logged-in checkout.
// Prices, delivery fee and totals are ALWAYS computed here from the database.
exports.createOrder = ah(async (req, res) => {
  const { items, customer: contact = {}, deliveryAddress = {}, deliverySlot, notes, paymentMethod } = req.body;
  const settings = await ShopSettings.get();

  if (!Array.isArray(items) || items.length === 0) throw httpError(400, "Your cart is empty");
  if (items.length > 30) throw httpError(400, "Too many items in one order");
  const phone = normalizePhone(contact.phone || req.customer?.mobileNumber);
  const name = String(contact.name || req.customer?.name || "").trim();
  if (name.length < 2) throw httpError(400, "Please enter your name");
  if (!/^[6-9]\d{9}$/.test(phone)) throw httpError(400, "Enter a valid 10-digit mobile number");
  if (!deliveryAddress.line1 || !deliveryAddress.area || !deliveryAddress.city) throw httpError(400, "Please complete the delivery address");
  if (!isServiceable(deliveryAddress.pincode, settings)) throw httpError(400, `Sorry, we don't deliver to PIN code ${deliveryAddress.pincode || ""} yet`);
  if (!["cod", "online"].includes(paymentMethod)) throw httpError(400, "Choose a payment method");
  if (paymentMethod === "cod" && !settings.codEnabled) throw httpError(400, "Cash on delivery is not available right now");
  if (paymentMethod === "online" && !isConfigured()) throw httpError(400, "Online payment is not available right now");
  if (settings.deliverySlots?.length && deliverySlot && !settings.deliverySlots.includes(deliverySlot))
    throw httpError(400, "Please choose a valid delivery slot");

  // Merge duplicate lines, then resolve products by id (or slug, for carts built offline).
  const merged = new Map();
  for (const it of items) {
    const qty = Math.floor(Number(it.quantity));
    if (!it.product || !Number.isFinite(qty) || qty < 1 || qty > 20) throw httpError(400, "Invalid item quantity");
    merged.set(String(it.product), (merged.get(String(it.product)) || 0) + qty);
  }

  const lines = [];
  for (const [ref, quantity] of merged) {
    const product = await ShopProduct.findOne({ isActive: true, ...(isObjectId(ref) ? { _id: ref } : { slug: ref }) });
    if (!product) throw httpError(400, "One of the products in your cart is no longer available");
    const unitPrice = product.unitPrice();
    lines.push({
      product: product._id,
      name: product.name,
      packageSize: product.packageSize,
      image: product.images?.[0],
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    });
  }

  // Reserve stock atomically; roll back everything if any line is short.
  const reserved = [];
  for (const l of lines) {
    const ok = await ShopProduct.updateOne(
      { _id: l.product, stockQuantity: { $gte: l.quantity } },
      { $inc: { stockQuantity: -l.quantity, soldCount: l.quantity } }
    );
    if (!ok.modifiedCount) {
      await restoreStock(reserved);
      throw httpError(409, `Sorry, only limited stock is left for ${l.name} (${l.packageSize}). Please reduce the quantity.`);
    }
    reserved.push(l);
  }

  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const deliveryFee = calcDelivery(subtotal, settings);

  try {
    const order = await Order.create({
      orderNumber: newOrderNumber(),
      customer: req.customer?._id || null,
      contact: { name, phone, email: String(contact.email || req.customer?.email || "").trim().toLowerCase() || undefined },
      items: lines,
      deliveryAddress: {
        line1: String(deliveryAddress.line1).trim(),
        area: String(deliveryAddress.area).trim(),
        city: String(deliveryAddress.city).trim(),
        state: String(deliveryAddress.state || "Maharashtra").trim(),
        pincode: String(deliveryAddress.pincode),
        instructions: String(deliveryAddress.instructions || "").trim().slice(0, 300),
      },
      deliverySlot,
      notes: String(notes || "").slice(0, 500),
      subtotal,
      deliveryFee,
      discount: 0,
      totalAmount: subtotal + deliveryFee,
      paymentMethod,
      statusHistory: [{ status: "pending", note: "Order placed" }],
    });
    res.status(201).json({ success: true, message: "Order placed", data: order });
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
});

exports.myOrders = ah(async (req, res) => {
  const data = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 }).select("-razorpay.signature").lean();
  res.json({ success: true, count: data.length, data });
});

exports.getMyOrder = ah(async (req, res) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Order not found");
  const order = await Order.findOne({ _id: req.params.id, customer: req.customer._id }).select("-razorpay.signature").lean();
  if (!order) throw httpError(404, "Order not found");
  res.json({ success: true, data: order });
});

// GET /api/shop/orders/track/:orderNumber?phone=  — guest order lookup (needs the matching phone)
exports.trackOrder = ah(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber, "contact.phone": normalizePhone(req.query.phone) })
    .select("orderNumber orderStatus paymentStatus totalAmount createdAt items deliverySlot statusHistory")
    .lean();
  if (!order) throw httpError(404, "No order found for that number and mobile");
  res.json({ success: true, data: order });
});

// ---------- Administrator ----------
exports.adminListOrders = ah(async (req, res) => {
  const { status, from, to, q } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 25);
  const filter = {};
  if (status) filter.orderStatus = status;
  if (from || to) filter.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(`${to}T23:59:59`) }) };
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ orderNumber: rx }, { "contact.name": rx }, { "contact.phone": rx }];
  }
  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, count: data.length, total, page, data });
});

exports.adminGetOrder = ah(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("customer", "name mobileNumber email").lean();
  if (!order) throw httpError(404, "Order not found");
  res.json({ success: true, data: order });
});

// PATCH /api/shop/admin/orders/:id/status  { orderStatus?, paymentStatus?, note? }
exports.adminUpdateStatus = ah(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, "Order not found");
  const { orderStatus, paymentStatus, note } = req.body;
  if (orderStatus) {
    if (!ORDER_STATUSES.includes(orderStatus)) throw httpError(400, "Invalid order status");
    if (order.orderStatus === "cancelled" && orderStatus !== "cancelled") throw httpError(400, "A cancelled order cannot be reopened");
    if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") await restoreStock(order.items);
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note });
    // COD orders are paid when delivered.
    if (orderStatus === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
  }
  // Online payments are only marked paid through signature verification — admins may record COD/refunds.
  if (paymentStatus) {
    if (order.paymentMethod === "online" && paymentStatus === "paid" && order.paymentStatus !== "paid")
      throw httpError(400, "Online payments are confirmed automatically after verification");
    order.paymentStatus = paymentStatus;
  }
  await order.save();
  res.json({ success: true, message: "Order updated", data: order });
});
