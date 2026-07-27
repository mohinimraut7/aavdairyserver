const Animal = require("../models/Animal");
const Milk = require("../models/Milk");
const Vaccination = require("../models/Vaccination");
const Medical = require("../models/Medical");
const FeedStock = require("../models/FeedStock");

// GET /api/dashboard/summary
// Single call that powers the whole Dashboard.jsx page: the 6 StatCards,
// HeroBanner's 3 stats, RecentAnimals, VaccinationTable and MedicalTable.
// Kept as one endpoint so every widget reads the same numbers (fixes the
// old bug where HeroBanner and StatCard showed two different "Today's Milk"
// values because each was hardcoded separately).
const getDashboardSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const [
      totalAnimals, totalCows, totalBuffaloes, pregnant,
      milkRecords, vaccinations, feedStock,
      recentAnimals, recentMedical,
    ] = await Promise.all([
      Animal.countDocuments({ isActive: true }),
      Animal.countDocuments({ isActive: true, species: "Cow" }),
      Animal.countDocuments({ isActive: true, species: "Buffalo" }),
      Animal.countDocuments({ isActive: true, category: "Pregnant" }),
      Milk.find({}),
      Vaccination.find({}),
      FeedStock.find({}),
      Animal.find({ isActive: true }).sort({ createdAt: -1 }).limit(4),
      Medical.find({}).sort({ date: -1 }).limit(2),
    ]);

    const todaysMilk = milkRecords
      .filter((r) => new Date(r.date).toISOString().split("T")[0] === todayStr)
      .reduce((sum, r) => sum + r.morning + r.evening, 0);

    const vaccinationsWithStatus = vaccinations.map((v) => ({
      ...v.toObject(),
      status: v.getDueStatus(),
    }));
    const dueVaccinations = vaccinationsWithStatus.filter((v) => v.status !== "Upcoming").length;
    const upcomingVaccinations = vaccinationsWithStatus
      .filter((v) => v.status === "Due Soon" || v.status === "Overdue")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);

    const totalCapacity = feedStock.reduce((sum, s) => sum + (s.capacity || 0), 0);
    const totalCurrent = feedStock.reduce((sum, s) => sum + (s.currentStock || 0), 0);
    const feedStockPct = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAnimals,
        totalCows,
        totalBuffaloes,
        todaysMilk: Number(todaysMilk.toFixed(1)),
        pregnant,
        dueVaccinations,
        feedStockPct,
        recentAnimals,
        upcomingVaccinations,
        recentMedical,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardSummary };
