// const express = require("express");
// const router = express.Router();
// const {
//   getMilkRecords, getMilkSummary, getMilkChart,
//   createMilkRecord, updateMilkRecord, deleteMilkRecord,
// } = require("../controllers/milkController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);
// router.get("/summary", getMilkSummary);
// router.get("/chart", getMilkChart);
// router.route("/").get(getMilkRecords).post(createMilkRecord);
// router.route("/:id").put(updateMilkRecord).delete(deleteMilkRecord);

// module.exports = router;




const express = require("express");
const router = express.Router();
const {
  getMilkRecords, getMilkSummary, getMilkChart,
  createMilkRecord, updateMilkRecord, deleteMilkRecord,
} = require("../controllers/milkController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);
router.get("/summary", getMilkSummary);
router.get("/chart", getMilkChart);
router.route("/").get(getMilkRecords).post(permit("milk", "create"), createMilkRecord);
router.route("/:id").put(permit("milk", "update"), updateMilkRecord).delete(permit("milk", "remove"), deleteMilkRecord);

module.exports = router;