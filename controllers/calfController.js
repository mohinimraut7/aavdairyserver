const Calf = require("../models/Calf");
const Animal = require("../models/Animal");

// GET /api/calves
const getCalves = async (req, res) => {
  try {
    const calves = await Calf.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: calves.length, data: calves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/calves/:id
const getCalfById = async (req, res) => {
  try {
    const calf = await Calf.findById(req.params.id).populate("dam", "name tag species");
    if (!calf) return res.status(404).json({ success: false, message: "Calf not found" });
    res.status(200).json({ success: true, data: calf });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/calves
// Body matches CalfManagement.jsx form: tag, name, damId, sireInfo, gender, dob, weight, weaningStatus
const createCalf = async (req, res) => {
  try {
    const { damId, dam, ...rest } = req.body;
    const damRef = damId || dam;
    if (!damRef) return res.status(400).json({ success: false, message: "damId is required" });

    const damAnimal = await Animal.findById(damRef);
    if (!damAnimal) return res.status(404).json({ success: false, message: "Dam (mother) animal not found" });

    const calf = await Calf.create({
      ...rest,
      dam: damAnimal._id,
      damName: damAnimal.name,
      species: damAnimal.species,
    });

    res.status(201).json({ success: true, message: "Calf added successfully", data: calf });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "A calf with that tag already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/calves/:id
const updateCalf = async (req, res) => {
  try {
    const calf = await Calf.findById(req.params.id);
    if (!calf) return res.status(404).json({ success: false, message: "Calf not found" });

    const { damId, dam, ...rest } = req.body;
    const updateData = {};
    ["tag", "name", "gender", "dob", "weight", "weaningStatus"].forEach((f) => {
      if (rest[f] !== undefined) updateData[f] = rest[f];
    });

    const damRef = damId || dam;
    if (damRef && String(damRef) !== String(calf.dam)) {
      const damAnimal = await Animal.findById(damRef);
      if (!damAnimal) return res.status(404).json({ success: false, message: "Dam (mother) animal not found" });
      updateData.dam = damAnimal._id;
      updateData.damName = damAnimal.name;
      updateData.species = damAnimal.species;
    }
    if (rest.sireInfo !== undefined) updateData.sireInfo = rest.sireInfo;

    Object.assign(calf, updateData);
    await calf.save();
    res.status(200).json({ success: true, message: "Calf updated successfully", data: calf });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/calves/:id -> soft delete
const deleteCalf = async (req, res) => {
  try {
    const calf = await Calf.findById(req.params.id);
    if (!calf) return res.status(404).json({ success: false, message: "Calf not found" });
    calf.isActive = false;
    await calf.save();
    res.status(200).json({ success: true, message: "Calf record deactivated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCalves, getCalfById, createCalf, updateCalf, deleteCalf };
