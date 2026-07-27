const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    symptoms: { type: String, trim: true },
    causes: { type: String, trim: true },
    treatment: { type: String, trim: true },
    associatedMedicines: [{ type: String, trim: true }],
    requiresIsolation: { type: Boolean, default: false },
    recoveryTime: { type: String, trim: true },
    preventiveMeasures: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disease", diseaseSchema);
