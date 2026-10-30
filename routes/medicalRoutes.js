// const express = require("express");
// const router = express.Router();
// const {
//   getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
// } = require("../controllers/medicalController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);
// router.route("/").get(getMedicalRecords).post(createMedicalRecord);
// router.route("/:id").put(updateMedicalRecord).delete(deleteMedicalRecord);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
} = require("../controllers/medicalController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getMedicalRecords).post(permit("medical", "create"), createMedicalRecord);
router.route("/:id").put(permit("medical", "update"), updateMedicalRecord).delete(permit("medical", "remove"), deleteMedicalRecord);

module.exports = router;