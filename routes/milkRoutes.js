const express = require("express");
const router = express.Router();
const {
  getMilkRecords, getMilkSummary, getMilkChart,
  createMilkRecord, updateMilkRecord, deleteMilkRecord,
} = require("../controllers/milkController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.get("/summary", getMilkSummary);
router.get("/chart", getMilkChart);
router.route("/").get(getMilkRecords).post(createMilkRecord);
router.route("/:id").put(updateMilkRecord).delete(deleteMilkRecord);

module.exports = router;
