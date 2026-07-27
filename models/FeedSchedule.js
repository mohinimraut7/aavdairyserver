const mongoose = require("mongoose");

const feedScheduleSchema = new mongoose.Schema(
  {
    group: {
      type: String,
      required: true,
      enum: ["Lactating Cows", "Lactating Buffaloes", "Dry Cows", "Pregnant Animals", "Calves", "Bulls"],
    },
    feedType: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedSchedule", feedScheduleSchema);
