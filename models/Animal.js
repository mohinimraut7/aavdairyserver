const mongoose = require("mongoose");
const crypto = require("crypto");

const CATEGORIES = [
  "Milking", "Lactating", "Pregnant", "Dry", "Calf", "Bull", "Heifer",
  "Breeding Bull", "Sick", "Quarantined", "Old", "Sold", "Dead", "Adopted",
];

const categoryHistorySchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    reason: { type: String, trim: true },
    changedBy: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const animalSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ["Cow", "Buffalo"], required: true },
    breed: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    dob: { type: Date },
    weight: { type: Number },
    color: { type: String, trim: true },
    purchaseDate: { type: Date },
    category: { type: String, enum: CATEGORIES, default: "Dry" },
    photo: { type: String },
    categoryHistory: { type: [categoryHistorySchema], default: [] },
    qrCode: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

animalSchema.pre("save", function assignQrCode(next) {
  if (!this.qrCode) this.qrCode = crypto.randomUUID();
  next();
});

// FR-2.1: Animals.jsx's form/table use the field name "status"; the model
// stores it as "category". This virtual exposes "status" as an alias of
// "category" on every JSON response so the existing frontend (which reads
// a.status / writes status) keeps working with zero UI changes.
animalSchema.virtual("status").get(function () {
  return this.category;
});

animalSchema.set("toJSON", { virtuals: true });
animalSchema.set("toObject", { virtuals: true });

animalSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model("Animal", animalSchema);
