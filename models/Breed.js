const mongoose = require("mongoose");

const breedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    species: { type: String, enum: ["Cow", "Buffalo"], required: true },
    origin: { type: String, enum: ["Indian", "International", "Cross", "Custom"], default: "Indian" },
    milkCapacity: { type: String, trim: true },
    avgFatPercent: { type: Number },
    avgWeight: { type: Number },
    lifespan: { type: String, trim: true },
    diseaseResistance: { type: String, trim: true },
    climateSuitability: { type: String, trim: true },
    description: { type: String, trim: true },
    photo: { type: String },
    isSystemSeeded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Breed", breedSchema);
