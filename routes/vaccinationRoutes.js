const express = require("express");
const router = express.Router();
const {
  getVaccinations, getVaccinationSummary, createVaccination, updateVaccination, deleteVaccination,
} = require("../controllers/vaccinationController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.get("/summary", getVaccinationSummary);
router.route("/").get(getVaccinations).post(createVaccination);
router.route("/:id").put(updateVaccination).delete(deleteVaccination);

module.exports = router;
