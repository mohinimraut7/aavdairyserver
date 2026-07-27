const express = require("express");
const router = express.Router();
const {
  getBreedingRecords, createBreedingRecord, updateBreedingRecord, deleteBreedingRecord,
} = require("../controllers/breedingController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getBreedingRecords).post(createBreedingRecord);
router.route("/:id").put(updateBreedingRecord).delete(deleteBreedingRecord);

module.exports = router;
