const Order = require("../models/Order");
const { ah, httpError, isObjectId } = require("../utils/helpers");
const { isConfigured, createRazorpayOrder, verifySignature } = require("../utils/razorpay");

// POST /api/shop/payments/create-order  { orderId }
exports.createPaymentOrder = ah(async (req, res) => {
  if (!isConfigured()) throw httpError(400, "Online payment is not configured");
  if (!isObjectId(req.body.orderId)) throw httpError(404, "Order not found");
  const order = await Order.findById(req.body.orderId);
  if (!order || order.paymentMethod !== "online") throw httpError(404, "Order not found");
  if (order.paymentStatus === "paid") throw httpError(400, "This order is already paid");
  if (order.orderStatus === "cancelled") throw httpError(400, "This order was cancelled");

  const rp = await createRazorpayOrder({
    amountPaise: Math.round(order.totalAmount * 100), // amount from the DB, never from the client
    receipt: order.orderNumber,
    notes: { orderNumber: order.orderNumber },
  });
  order.razorpay = { orderId: rp.id };
  await order.save();
  res.json({
    success: true,
    data: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rp.id, amount: rp.amount, currency: rp.currency },
  });
});

// POST /api/shop/payments/verify  { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
exports.verifyPayment = ah(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!isObjectId(orderId)) throw httpError(404, "Order not found");
  const order = await Order.findById(orderId);
  if (!order || order.razorpay?.orderId !== razorpay_order_id) throw httpError(400, "Payment does not match this order");
  if (!verifySignature({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, signature: razorpay_signature })) {
    order.paymentStatus = "failed";
    await order.save();
    throw httpError(400, "Payment verification failed");
  }
  order.paymentStatus = "paid";
  order.razorpay.paymentId = razorpay_payment_id;
  order.razorpay.signature = razorpay_signature;
  if (order.orderStatus === "pending") {
    order.orderStatus = "confirmed";
    order.statusHistory.push({ status: "confirmed", note: "Online payment received" });
  }
  await order.save();
  res.json({ success: true, message: "Payment verified", data: { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus } });
});
