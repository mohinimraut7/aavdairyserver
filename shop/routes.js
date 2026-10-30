const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { protectCustomer, optionalCustomer } = require("./middlewares/customerAuth");
const product = require("./controllers/productController");
const auth = require("./controllers/customerAuthController");
const order = require("./controllers/orderController");
const payment = require("./controllers/paymentController");
const admin = require("./controllers/adminShopController");
const contact = require("./controllers/contactController");

// Simple in-memory rate limiter for login/register/contact (per IP).
const limiter = (max, windowMs) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const rec = hits.get(key) || { n: 0, reset: now + windowMs };
    if (now > rec.reset) Object.assign(rec, { n: 0, reset: now + windowMs });
    rec.n += 1;
    hits.set(key, rec);
    if (rec.n > max) return res.status(429).json({ success: false, message: "Too many attempts. Please try again in a few minutes." });
    next();
  };
};

const router = express.Router();

// ---- Public storefront ----
router.get("/config", product.getConfig);
router.get("/products", product.listProducts);
router.get("/products/:slug", product.getProduct);
router.post("/contact", limiter(10, 60 * 60 * 1000), contact.sendMessage);

// ---- Customer profile (register/login: POST /api/auth/register|login with role "customer") ----
router.get("/auth/me", protectCustomer, auth.me);
router.put("/auth/me", protectCustomer, auth.updateMe);
router.post("/auth/addresses", protectCustomer, auth.addAddress);
router.delete("/auth/addresses/:id", protectCustomer, auth.deleteAddress);

// ---- Orders & payments ----
router.post("/orders", optionalCustomer, order.createOrder);
router.get("/orders/my-orders", protectCustomer, order.myOrders);
router.get("/orders/track/:orderNumber", order.trackOrder);
router.get("/orders/:id", protectCustomer, order.getMyOrder);
router.post("/payments/create-order", payment.createPaymentOrder);
router.post("/payments/verify", payment.verifyPayment);

// ---- Administrator (farm staff token from /api/auth/login) ----
const adminOnly = [protect, authorize("Administrator")];
router.get("/admin/dashboard", adminOnly, admin.dashboard);
router.get("/admin/products", adminOnly, product.adminListProducts);
router.post("/admin/products", adminOnly, product.createProduct);
router.put("/admin/products/:id", adminOnly, product.updateProduct);
router.delete("/admin/products/:id", adminOnly, product.deleteProduct);
router.get("/admin/orders", adminOnly, order.adminListOrders);
router.get("/admin/orders/:id", adminOnly, order.adminGetOrder);
router.patch("/admin/orders/:id/status", adminOnly, order.adminUpdateStatus);
router.get("/admin/customers", adminOnly, admin.customers);
router.get("/admin/settings", adminOnly, admin.getSettings);
router.put("/admin/settings", adminOnly, admin.updateSettings);
router.get("/admin/messages", adminOnly, admin.messages);

module.exports = router;
