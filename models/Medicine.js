const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    brandName: { type: String, trim: true },
    type: { type: String, trim: true },
    purpose: { type: String, trim: true },
    dosage: { type: String, trim: true },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    expiryDate: { type: Date },
    batchNumber: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    purchasePrice: { type: Number },
    sellingPrice: { type: Number },
    storageInstructions: { type: String, trim: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    sideEffects: { type: String, trim: true },
    requiresPrescription: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.statics.decrementStock = async function decrementStock(medicineId, qty) {
  const medicine = await this.findById(medicineId);
  if (!medicine) throw new Error("Medicine not found");
  if (medicine.stock < qty) throw new Error("Insufficient medicine stock");
  medicine.stock -= qty;
  await medicine.save();
  return medicine;
};

module.exports = mongoose.model("Medicine", medicineSchema);
