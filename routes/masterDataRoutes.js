// const express = require("express");
// const router = express.Router();
// const {
//   breedController, diseaseController, supplierController, medicineController,
// } = require("../controllers/masterDataController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);

// // Breeds
// router.route("/breeds").get(breedController.getAll).post(breedController.create);
// router.route("/breeds/:id").get(breedController.getById).put(breedController.update).delete(breedController.remove);

// // Diseases
// router.route("/diseases").get(diseaseController.getAll).post(diseaseController.create);
// router.route("/diseases/:id").get(diseaseController.getById).put(diseaseController.update).delete(diseaseController.remove);

// // Suppliers
// router.route("/suppliers").get(supplierController.getAll).post(supplierController.create);
// router.route("/suppliers/:id").get(supplierController.getById).put(supplierController.update).delete(supplierController.remove);

// // Medicines
// router.route("/medicines").get(medicineController.getAll).post(medicineController.create);
// router.route("/medicines/:id").get(medicineController.getById).put(medicineController.update).delete(medicineController.remove);
// router.post("/medicines/:id/dispense", medicineController.dispense);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  breedController, diseaseController, supplierController, medicineController,
} = require("../controllers/masterDataController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);

// Breeds
router.route("/breeds").get(breedController.getAll).post(permit("breeds", "create"), breedController.create);
router.route("/breeds/:id").get(breedController.getById).put(permit("breeds", "update"), breedController.update).delete(permit("breeds", "remove"), breedController.remove);

// Diseases
router.route("/diseases").get(diseaseController.getAll).post(permit("diseases", "create"), diseaseController.create);
router.route("/diseases/:id").get(diseaseController.getById).put(permit("diseases", "update"), diseaseController.update).delete(permit("diseases", "remove"), diseaseController.remove);

// Suppliers
router.route("/suppliers").get(supplierController.getAll).post(permit("suppliers", "create"), supplierController.create);
router.route("/suppliers/:id").get(supplierController.getById).put(permit("suppliers", "update"), supplierController.update).delete(permit("suppliers", "remove"), supplierController.remove);

// Medicines
router.route("/medicines").get(medicineController.getAll).post(permit("medicines", "create"), medicineController.create);
router.route("/medicines/:id").get(medicineController.getById).put(permit("medicines", "update"), medicineController.update).delete(permit("medicines", "remove"), medicineController.remove);
router.post("/medicines/:id/dispense", permit("medicines", "dispense"), medicineController.dispense);

module.exports = router;
