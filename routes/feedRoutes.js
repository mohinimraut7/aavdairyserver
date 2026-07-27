const express = require("express");
const router = express.Router();
const {
  getFeedStock, getFeedStockSummary, createFeedStock, updateFeedStock, deleteFeedStock,
  getFeedSchedule, createFeedSchedule, updateFeedSchedule, deleteFeedSchedule,
} = require("../controllers/feedController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.get("/stock/summary", getFeedStockSummary);
router.route("/stock").get(getFeedStock).post(createFeedStock);
router.route("/stock/:id").put(updateFeedStock).delete(deleteFeedStock);

router.route("/schedule").get(getFeedSchedule).post(createFeedSchedule);
router.route("/schedule/:id").put(updateFeedSchedule).delete(deleteFeedSchedule);

module.exports = router;
