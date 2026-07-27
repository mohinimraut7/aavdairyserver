const Animal = require("../models/Animal");

// GET /api/animals?species=Cow&search=ganga&category=Dry
const getAnimals = async (req, res) => {
  try {
    const { species, search, category } = req.query;
    const filter = { isActive: true };
    if (species && species !== "All") filter.species = species;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { tag: { $regex: search, $options: "i" } },
      ];
    }
    const animals = await Animal.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: animals.length, data: animals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/animals/:id
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ success: false, message: "Animal not found" });
    res.status(200).json({ success: true, data: animal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/animals
// Body matches Animals.jsx "Add New Animal" form as-is:
// tag, name, species, breed, gender, status, dob, weight, color, purchaseDate, photo
const createAnimal = async (req, res) => {
  try {
    const { tag, name, species, breed, gender, status, category, dob, weight, color, purchaseDate, photo } = req.body;

    if (!tag || !name || !species || !gender) {
      return res.status(400).json({ success: false, message: "tag, name, species and gender are required" });
    }

    const animal = await Animal.create({
      tag,
      name,
      species,
      breed,
      gender,
      category: category || status || "Dry", // form sends "status"; model field is "category"
      dob: dob || null,
      weight: weight || undefined,
      color,
      purchaseDate: purchaseDate || null,
      photo,
    });

    res.status(201).json({ success: true, message: "Animal added successfully", data: animal });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "An animal with that tag already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/animals/:id
const updateAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ success: false, message: "Animal not found" });

    const updateData = {};
    if (req.body.tag !== undefined) updateData.tag = req.body.tag;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.species !== undefined) updateData.species = req.body.species;
    if (req.body.breed !== undefined) updateData.breed = req.body.breed;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;
    if (req.body.dob !== undefined) updateData.dob = req.body.dob || null;
    if (req.body.weight !== undefined) updateData.weight = req.body.weight;
    if (req.body.color !== undefined) updateData.color = req.body.color;
    if (req.body.purchaseDate !== undefined) updateData.purchaseDate = req.body.purchaseDate || null;
    if (req.body.photo !== undefined) updateData.photo = req.body.photo;

    // Form field is "status"; model field is "category".
    const newCategory = req.body.category !== undefined ? req.body.category : req.body.status;
    if (newCategory !== undefined && newCategory !== animal.category) {
      updateData.category = newCategory;
      animal.categoryHistory.push({
        category: newCategory,
        reason: req.body.categoryChangeReason || "",
        changedBy: req.user?.username || req.user?.email || "system",
        date: new Date(),
      });
    }

    Object.assign(animal, updateData);
    await animal.save();

    res.status(200).json({ success: true, message: "Animal updated successfully", data: animal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/animals/:id -> soft delete (isActive = false)
const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ success: false, message: "Animal not found" });
    animal.isActive = false;
    await animal.save();
    res.status(200).json({ success: true, message: "Animal deactivated successfully", data: animal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAnimals, getAnimalById, createAnimal, updateAnimal, deleteAnimal };
