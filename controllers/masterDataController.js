const Breed = require("../models/Breed");
const Disease = require("../models/Disease");
const Medicine = require("../models/Medicine");
const Supplier = require("../models/Supplier");

// Shared CRUD factory for the four simple master-data resources
// (Breed / Disease / Supplier / Medicine). Each still gets its own route
// file for clarity and future customization (e.g. Medicine's dispense route).
function makeCrudController(Model, { softDelete = true } = {}) {
  return {
    getAll: async (req, res) => {
      try {
        const filter = softDelete ? { isActive: true } : {};
        const docs = await Model.find(filter).sort({ name: 1 });
        res.status(200).json({ success: true, count: docs.length, data: docs });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    },
    getById: async (req, res) => {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: `${Model.modelName} not found` });
        res.status(200).json({ success: true, data: doc });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    },
    create: async (req, res) => {
      try {
        const doc = await Model.create(req.body);
        res.status(201).json({ success: true, message: `${Model.modelName} added successfully`, data: doc });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({ success: false, message: `A ${Model.modelName.toLowerCase()} with that name already exists` });
        }
        res.status(400).json({ success: false, message: err.message });
      }
    },
    update: async (req, res) => {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ success: false, message: `${Model.modelName} not found` });
        res.status(200).json({ success: true, message: `${Model.modelName} updated successfully`, data: doc });
      } catch (err) {
        res.status(400).json({ success: false, message: err.message });
      }
    },
    remove: async (req, res) => {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: `${Model.modelName} not found` });

        if (softDelete && "isActive" in doc.schema.paths) {
          // FR-1.5 / FR-3.3.5: soft-delete (deactivate) master data, never
          // hard delete, since other collections may reference it.
          doc.isActive = false;
          await doc.save();
          return res.status(200).json({ success: true, message: `${Model.modelName} deactivated successfully` });
        }
        await Model.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: `${Model.modelName} deleted successfully` });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    },
  };
}

const breedController = makeCrudController(Breed);
const diseaseController = makeCrudController(Disease);
const supplierController = makeCrudController(Supplier);
const medicineController = makeCrudController(Medicine);

// POST /api/medicine/:id/dispense  { quantity }
// FR-4.2: the only sanctioned way to reduce medicine stock.
medicineController.dispense = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "A positive quantity is required" });
    }
    const medicine = await Medicine.decrementStock(req.params.id, quantity);
    res.status(200).json({ success: true, message: "Medicine stock updated successfully", data: medicine });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { breedController, diseaseController, supplierController, medicineController };
