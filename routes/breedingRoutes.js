// const express = require("express");
// const router = express.Router();
// const {
//   getBreedingRecords, createBreedingRecord, updateBreedingRecord, deleteBreedingRecord,
// } = require("../controllers/breedingController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);
// router.route("/").get(getBreedingRecords).post(createBreedingRecord);
// router.route("/:id").put(updateBreedingRecord).delete(deleteBreedingRecord);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  getBreedingRecords, createBreedingRecord, updateBreedingRecord, deleteBreedingRecord,
} = require("../controllers/breedingController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getBreedingRecords).post(permit("breeding", "create"), createBreedingRecord);
router.route("/:id").put(permit("breeding", "update"), updateBreedingRecord).delete(permit("breeding", "remove"), deleteBreedingRecord);

module.exports = router;
