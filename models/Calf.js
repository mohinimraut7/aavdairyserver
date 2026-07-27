const mongoose = require("mongoose");

const calfSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ["Cow", "Buffalo"] },
    dam: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    damName: { type: String, trim: true },
    sireInfo: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    dob: { type: Date, required: true },
    weight: { type: Number },
    weaningStatus: { type: String, enum: ["Not Weaned", "Weaned"], default: "Not Weaned" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calf", calfSchema);
