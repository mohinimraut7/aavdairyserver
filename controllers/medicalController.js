const Medical = require("../models/Medical");
const Animal = require("../models/Animal");

// GET /api/medical?type=Mastitis&animalId=...&limit=10
const getMedicalRecords = async (req, res) => {
  try {
    const { type, animalId, limit } = req.query;
    const filter = {};
    if (type && type !== "All") filter.type = type;
    if (animalId) filter.animal = animalId;

    let query = Medical.find(filter).sort({ date: -1 });
    if (limit) query = query.limit(Number(limit));

    const records = await query;
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/medical
// Body matches MedicalHistory.jsx form: animalId, type, symptom, diagnosis,
// quarter, cmtResult, medicine, dosage, score, notes, treatment, doctor, date, followUp
const createMedicalRecord = async (req, res) => {
  try {
    const { animalId, animal, ...rest } = req.body;
    const animalRef = animalId || animal;
    if (!animalRef) return res.status(400).json({ success: false, message: "animalId is required" });

    const animalDoc = await Animal.findById(animalRef);
    if (!animalDoc) return res.status(404).json({ success: false, message: "Animal not found" });

    const record = await Medical.create({
      ...rest,
      animal: animalDoc._id,
      animalName: animalDoc.name,
    });

    // SRS FR-7.3: diseases that require isolation should prompt (not force) a
    // category change to Quarantined - we flag it back to the client.
    const isolationTypes = ["Mastitis"];
    const suggestQuarantine = isolationTypes.includes(record.type);

    res.status(201).json({
      success: true,
      message: "Medical record saved successfully",
      data: record,
      suggestQuarantine,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/medical/:id
const updateMedicalRecord = async (req, res) => {
  try {
    const { animalId, animal, ...rest } = req.body;
    const updateData = {};
    [
      "type", "symptom", "diagnosis", "quarter", "cmtResult", "treatment",
      "medicine", "dosage", "score", "notes", "doctor", "date", "followUp",
    ].forEach((f) => {
      if (rest[f] !== undefined) updateData[f] = rest[f];
    });

    const record = await Medical.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ success: false, message: "Medical record not found" });

    res.status(200).json({ success: true, message: "Medical record updated successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/medical/:id
const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await Medical.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Medical record not found" });
    res.status(200).json({ success: true, message: "Medical record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord };
