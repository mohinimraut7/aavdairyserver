const mongoose = require("mongoose");

const ORDER_STATUSES = ["pending", "confirmed", "processing", "out-for-delivery", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "ShopProduct", required: true },
    name: String,
    packageSize: String,
    image: String,
    unitPrice: Number, // price taken from the DB at order time
    quantity: { type: Number, min: 1 },
    lineTotal: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, // User with role "customer"
    contact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
      email: { type: String, trim: true, lowercase: true },
    },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    deliveryAddress: {
      line1: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      pincode: { type: String, required: true, match: /^\d{6}$/ },
      instructions: String,
    },
    deliverySlot: String,
    notes: { type: String, maxlength: 500 },
    subtotal: Number,
    deliveryFee: Number,
    discount: { type: Number, default: 0 },
    totalAmount: Number,
    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ "contact.phone": 1 });

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
