const mongoose = require("mongoose");

const CATEGORIES = ["milk", "paneer", "ghee", "curd"];

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const shopProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    images: [{ type: String }], // URL, "/images/.." bundled path, or base64 data URI
    sku: { type: String, trim: true, unique: true, sparse: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    packageSize: { type: String, required: true, trim: true },
    stockQuantity: { type: Number, min: 0, default: 0 },
    highlights: [{ type: String, trim: true, maxlength: 60 }],
    ingredients: { type: String, trim: true, default: "" },
    storage: { type: String, trim: true, default: "" },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    soldCount: { type: Number, default: 0 },
    // Only filled from genuine customer reviews — never seeded with fake numbers.
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

shopProductSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(`${this.name} ${this.packageSize || ""}`);
  if (this.salePrice != null && this.salePrice >= this.price) this.salePrice = null;
  next();
});

shopProductSchema.methods.unitPrice = function unitPrice() {
  return this.salePrice != null && this.salePrice < this.price ? this.salePrice : this.price;
};

module.exports = mongoose.model("ShopProduct", shopProductSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.slugify = slugify;
