const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
    animalName: { type: String, trim: true },
    vaccine: { type: String, required: true, trim: true },
    lastGiven: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    vet: { type: String, trim: true },
  },
  { timestamps: true }
);

vaccinationSchema.methods.getDueStatus = function getDueStatus() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays <= 7) return "Due Soon";
  return "Upcoming";
};

module.exports = mongoose.model("Vaccination", vaccinationSchema);
