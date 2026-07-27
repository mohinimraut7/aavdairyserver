const mongoose = require("mongoose");

const milkSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    animalName: { type: String, trim: true },
    date: { type: Date, required: true },
    morning: { type: Number, required: true, default: 0 },
    evening: { type: Number, required: true, default: 0 },
    fat: { type: Number },
    snf: { type: Number },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

milkSchema.virtual("total").get(function computeTotal() {
  return Number((this.morning + this.evening).toFixed(1));
});

module.exports = mongoose.model("Milk", milkSchema);
