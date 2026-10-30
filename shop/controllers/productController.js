const ShopProduct = require("../models/ShopProduct");
const ShopSettings = require("../models/ShopSettings");
const { ah, httpError, isObjectId } = require("../utils/helpers");
const { isConfigured } = require("../utils/razorpay");

const PUBLIC_FIELDS = "-__v";

// GET /api/shop/products  (public — active products only)
exports.listProducts = ah(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const data = await ShopProduct.find(filter).select(PUBLIC_FIELDS).sort({ isFeatured: -1, createdAt: 1 }).lean();
  res.json({ success: true, count: data.length, data });
});

// GET /api/shop/products/:slug  (slug or id)
exports.getProduct = ah(async (req, res) => {
  const { slug } = req.params;
  const product = await ShopProduct.findOne({ isActive: true, ...(isObjectId(slug) ? { _id: slug } : { slug }) }).lean();
  if (!product) throw httpError(404, "Product not found");
  res.json({ success: true, data: product });
});

// GET /api/shop/config  (public storefront settings)
exports.getConfig = ah(async (req, res) => {
  const s = await ShopSettings.get();
  res.json({
    success: true,
    data: {
      freeDeliveryThreshold: s.freeDeliveryThreshold,
      deliveryFee: s.deliveryFee,
      codEnabled: s.codEnabled,
      onlinePaymentEnabled: isConfigured(),
      razorpayKeyId: isConfigured() ? process.env.RAZORPAY_KEY_ID : "",
      serviceablePincodePrefixes: s.serviceablePincodePrefixes,
      deliverySlots: s.deliverySlots,
    },
  });
});

// ---------- Administrator ----------
const EDITABLE = [
  "name", "slug", "description", "category", "images", "sku", "price", "salePrice", "packageSize",
  "stockQuantity", "highlights", "ingredients", "storage", "isFeatured", "isActive",
];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

exports.adminListProducts = ah(async (req, res) => {
  const data = await ShopProduct.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: data.length, data });
});

exports.createProduct = ah(async (req, res) => {
  const product = await ShopProduct.create(pick(req.body));
  res.status(201).json({ success: true, message: "Product created", data: product });
});

exports.updateProduct = ah(async (req, res) => {
  const product = await ShopProduct.findById(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  Object.assign(product, pick(req.body));
  await product.save();
  res.json({ success: true, message: "Product updated", data: product });
});

// Soft delete keeps old orders intact; ?hard=true removes it completely.
exports.deleteProduct = ah(async (req, res) => {
  const product = await ShopProduct.findById(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  if (req.query.hard === "true") await product.deleteOne();
  else {
    product.isActive = false;
    await product.save();
  }
  res.json({ success: true, message: req.query.hard === "true" ? "Product deleted" : "Product deactivated" });
});
