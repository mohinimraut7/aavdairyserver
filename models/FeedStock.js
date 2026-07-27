const mongoose = require("mongoose");

const feedStockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: {
      type: String,
      enum: ["Green Fodder", "Dry Fodder", "Silage", "Concentrate Feed", "Commercial Feed", ""],
      default: "",
    },
    unit: { type: String, enum: ["kg", "quintal", "ton"], default: "kg" },
    currentStock: { type: Number, required: true, default: 0 },
    capacity: { type: Number, required: true },
    dailyUsage: { type: Number, default: 0 },
    minStock: { type: Number },
    color: { type: String, default: "bg-farm-green" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedStock", feedStockSchema);
