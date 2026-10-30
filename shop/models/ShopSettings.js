const mongoose = require("mongoose");

// Single settings document for the storefront (edited by an Administrator).
const shopSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    freeDeliveryThreshold: { type: Number, default: 499, min: 0 },
    deliveryFee: { type: Number, default: 30, min: 0 },
    codEnabled: { type: Boolean, default: true },
    serviceablePincodePrefixes: { type: [String], default: ["4012", "4013"] },
    deliverySlots: { type: [String], default: ["Morning (6 AM – 9 AM)", "Evening (5 PM – 8 PM)"] },
  },
  { timestamps: true }
);

shopSettingsSchema.statics.get = async function get() {
  return (await this.findOne({ key: "default" })) || this.create({ key: "default" });
};

module.exports = mongoose.model("ShopSettings", shopSettingsSchema);
