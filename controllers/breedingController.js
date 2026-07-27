const Breeding = require("../models/Breeding");
const Animal = require("../models/Animal");

const GESTATION_DAYS = { Cow: 283, Buffalo: 310 };

function calcExpectedCalving(aiDate, species) {
  if (!aiDate) return undefined;
  const date = new Date(aiDate);
  date.setDate(date.getDate() + (GESTATION_DAYS[species] || 283));
  return date;
}

// GET /api/breeding?type=AI&animalId=...
const getBreedingRecords = async (req, res) => {
  try {
    const { type, animalId } = req.query;
    const filter = {};
    if (type && type !== "All") filter.type = type;
    if (animalId) filter.animal = animalId;
    const records = await Breeding.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/breeding
// Body matches Breeding.jsx form: animalId, type, heatDate, signs, aiDate,
// bullSemen, technician, pdDate, pdResult, notes, calvingDate, calfGender
const createBreedingRecord = async (req, res) => {
  try {
    const { animalId, animal, ...rest } = req.body;
    const animalRef = animalId || animal;
    if (!animalRef) return res.status(400).json({ success: false, message: "animalId is required" });

    const animalDoc = await Animal.findById(animalRef);
    if (!animalDoc) return res.status(404).json({ success: false, message: "Animal not found" });

    const payload = {
      ...rest,
      animal: animalDoc._id,
      animalName: animalDoc.name,
      species: animalDoc.species,
    };

    if (payload.type === "AI" && payload.aiDate) {
      payload.expectedCalving = calcExpectedCalving(payload.aiDate, animalDoc.species);
    }

    const record = await Breeding.create(payload);

    // Calving records move the animal back to the Milking category (SRS FR-2 trail)
    if (payload.type === "Calving") {
      animalDoc.category = "Milking";
      animalDoc.categoryHistory.push({
        category: "Milking",
        reason: "Calving recorded",
        date: new Date(),
      });
      await animalDoc.save();
    }

    res.status(201).json({ success: true, message: "Breeding record saved successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/breeding/:id
const updateBreedingRecord = async (req, res) => {
  try {
    const record = await Breeding.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Breeding record not found" });

    const updateData = {};
    const fields = [
      "type", "heatDate", "signs", "aiDate", "bullSemen", "technician",
      "pdDate", "pdResult", "calvingDate", "calfGender", "notes",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    Object.assign(record, updateData);

    if (record.type === "AI" && record.aiDate) {
      const animalDoc = await Animal.findById(record.animal);
      record.expectedCalving = calcExpectedCalving(record.aiDate, animalDoc?.species);
    }

    await record.save();
    res.status(200).json({ success: true, message: "Breeding record updated successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/breeding/:id
const deleteBreedingRecord = async (req, res) => {
  try {
    const record = await Breeding.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Breeding record not found" });
    res.status(200).json({ success: true, message: "Breeding record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBreedingRecords, createBreedingRecord, updateBreedingRecord, deleteBreedingRecord };
