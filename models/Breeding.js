const mongoose = require("mongoose");

const breedingSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    animalName: { type: String, trim: true },
    species: { type: String, enum: ["Cow", "Buffalo"] },

    type: {
      type: String,
      enum: ["Heat Detected", "AI", "Pregnancy Diagnosis", "Calving"],
      required: true,
    },

    heatDate: { type: Date },
    signs: { type: String, trim: true },

    aiDate: { type: Date },
    bullSemen: { type: String, trim: true },
    technician: { type: String, trim: true },
    expectedCalving: { type: Date },

    pdDate: { type: Date },
    pdResult: { type: String, enum: ["Positive", "Negative"] },

    calvingDate: { type: Date },
    calfGender: { type: String, enum: ["Male", "Female", ""] },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Breeding", breedingSchema);
