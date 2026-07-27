const mongoose = require("mongoose");

const medicalSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    animalName: { type: String, trim: true },
    type: { type: String, enum: ["Treatment", "Mastitis", "Deworming", "BCS"], required: true },

    symptom: { type: String, trim: true },
    diagnosis: { type: String, trim: true },

    quarter: { type: String, enum: ["Front-Left", "Front-Right", "Rear-Left", "Rear-Right", ""] },
    cmtResult: { type: String, trim: true },

    treatment: { type: String, trim: true },

    medicine: { type: String, trim: true },
    dosage: { type: String, trim: true },

    score: { type: String, trim: true },
    notes: { type: String, trim: true },

    doctor: { type: String, trim: true },
    date: { type: Date, required: true },
    followUp: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medical", medicalSchema);
