const Milk = require("../models/Milk");
const Animal = require("../models/Animal");

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// GET /api/milk?animalId=...&date=YYYY-MM-DD
const getMilkRecords = async (req, res) => {
  try {
    const { animalId, date } = req.query;
    const filter = {};
    if (animalId && animalId !== "All") filter.animal = animalId;
    if (date) filter.date = date;
    const records = await Milk.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/milk/summary -> powers the 3 stat cards at the top of MilkProduction.jsx
const getMilkSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const all = await Milk.find({});
    const todayRecords = all.filter((r) => new Date(r.date).toISOString().split("T")[0] === todayStr);
    const todaysTotal = todayRecords.reduce((sum, r) => sum + r.morning + r.evening, 0);
    const animalsMilking = new Set(all.map((r) => String(r.animal))).size;

    res.status(200).json({
      success: true,
      data: {
        todaysTotal: Number(todaysTotal.toFixed(1)),
        animalsMilking,
        totalEntries: all.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/milk/chart?range=Daily|Weekly|Monthly
// Powers MilkChart.jsx - returns [{ label, liters }] matching the widget's
// existing prop shape exactly so no UI changes are needed.
const getMilkChart = async (req, res) => {
  try {
    const range = req.query.range || "Daily";
    const all = await Milk.find({});

    let buckets = [];

    if (range === "Daily") {
      // last 7 calendar days, oldest first
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
      }
      buckets = days.map((d) => {
        const dayStr = d.toISOString().split("T")[0];
        const liters = all
          .filter((r) => new Date(r.date).toISOString().split("T")[0] === dayStr)
          .reduce((sum, r) => sum + r.morning + r.evening, 0);
        return { label: DAY_LABELS[d.getDay()], liters: Number(liters.toFixed(1)) };
      });
    } else if (range === "Weekly") {
      // last 4 weeks, oldest first
      const now = new Date();
      for (let w = 3; w >= 0; w--) {
        const end = new Date(now);
        end.setDate(end.getDate() - w * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const liters = all
          .filter((r) => {
            const d = new Date(r.date);
            return d >= start && d <= end;
          })
          .reduce((sum, r) => sum + r.morning + r.evening, 0);
        buckets.push({ label: `Week ${4 - w}`, liters: Number(liters.toFixed(1)) });
      }
    } else {
      // Monthly: last 5 calendar months, oldest first
      const now = new Date();
      for (let m = 4; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const liters = all
          .filter((r) => {
            const rd = new Date(r.date);
            return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
          })
          .reduce((sum, r) => sum + r.morning + r.evening, 0);
        buckets.push({ label: MONTH_LABELS[d.getMonth()], liters: Number(liters.toFixed(1)) });
      }
    }

    res.status(200).json({ success: true, data: buckets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/milk
// Body matches MilkProduction.jsx form: animalId, date, morning, evening, fat, snf
const createMilkRecord = async (req, res) => {
  try {
    const { animalId, animal, ...rest } = req.body;
    const animalRef = animalId || animal;
    if (!animalRef) return res.status(400).json({ success: false, message: "animalId is required" });

    const animalDoc = await Animal.findById(animalRef);
    if (!animalDoc) return res.status(404).json({ success: false, message: "Animal not found" });

    const record = await Milk.create({ ...rest, animal: animalDoc._id, animalName: animalDoc.name });
    res.status(201).json({ success: true, message: "Milk entry saved successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/milk/:id
const updateMilkRecord = async (req, res) => {
  try {
    const { animalId, animal, ...rest } = req.body;
    const updateData = {};
    ["date", "morning", "evening", "fat", "snf"].forEach((f) => {
      if (rest[f] !== undefined) updateData[f] = rest[f];
    });

    const record = await Milk.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: "Milk record not found" });

    res.status(200).json({ success: true, message: "Milk record updated successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/milk/:id
const deleteMilkRecord = async (req, res) => {
  try {
    const record = await Milk.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Milk record not found" });
    res.status(200).json({ success: true, message: "Milk record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMilkRecords, getMilkSummary, getMilkChart,
  createMilkRecord, updateMilkRecord, deleteMilkRecord,
};
