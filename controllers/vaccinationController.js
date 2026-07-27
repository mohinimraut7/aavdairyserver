const Vaccination = require("../models/Vaccination");
const Animal = require("../models/Animal");

const withStatus = (doc) => ({ ...doc.toObject(), status: doc.getDueStatus() });

// GET /api/vaccinations?filter=Overdue|Due Soon|Upcoming|All&limit=3
const getVaccinations = async (req, res) => {
  try {
    const { filter, animalId, limit } = req.query;
    const query = {};
    if (animalId) query.animal = animalId;

    let records = await Vaccination.find(query).sort({ dueDate: 1 });
    records = records.map(withStatus);

    if (filter && filter !== "All") {
      records = records.filter((r) => r.status === filter);
    }
    if (limit) records = records.slice(0, Number(limit));

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vaccinations/summary -> powers the 3 stat cards in Vaccination.jsx
const getVaccinationSummary = async (req, res) => {
  try {
    const records = (await Vaccination.find({})).map(withStatus);
    res.status(200).json({
      success: true,
      data: {
        overdue: records.filter((r) => r.status === "Overdue").length,
        dueSoon: records.filter((r) => r.status === "Due Soon").length,
        total: records.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vaccinations
// Body matches Vaccination.jsx form: animalId, vaccine, lastGiven, dueDate, vet
const createVaccination = async (req, res) => {
  try {
    const { animalId, animal, ...rest } = req.body;
    const animalRef = animalId || animal;
    if (!animalRef) return res.status(400).json({ success: false, message: "animalId is required" });

    const animalDoc = await Animal.findById(animalRef);
    if (!animalDoc) return res.status(404).json({ success: false, message: "Animal not found" });

    const record = await Vaccination.create({
      ...rest,
      animal: animalDoc._id,
      animalName: animalDoc.name,
    });

    res.status(201).json({ success: true, message: "Vaccination record saved successfully", data: withStatus(record) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/vaccinations/:id
const updateVaccination = async (req, res) => {
  try {
    const updateData = {};
    ["vaccine", "lastGiven", "dueDate", "vet"].forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const record = await Vaccination.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ success: false, message: "Vaccination record not found" });

    res.status(200).json({ success: true, message: "Vaccination record updated successfully", data: withStatus(record) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/vaccinations/:id
const deleteVaccination = async (req, res) => {
  try {
    const record = await Vaccination.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Vaccination record not found" });
    res.status(200).json({ success: true, message: "Vaccination record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getVaccinations, getVaccinationSummary, createVaccination, updateVaccination, deleteVaccination };
