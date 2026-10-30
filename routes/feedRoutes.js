// const express = require("express");
// const router = express.Router();
// const {
//   getFeedStock, getFeedStockSummary, createFeedStock, updateFeedStock, deleteFeedStock,
//   getFeedSchedule, createFeedSchedule, updateFeedSchedule, deleteFeedSchedule,
// } = require("../controllers/feedController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);
// router.get("/stock/summary", getFeedStockSummary);
// router.route("/stock").get(getFeedStock).post(createFeedStock);
// router.route("/stock/:id").put(updateFeedStock).delete(deleteFeedStock);

// router.route("/schedule").get(getFeedSchedule).post(createFeedSchedule);
// router.route("/schedule/:id").put(updateFeedSchedule).delete(deleteFeedSchedule);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  getFeedStock, getFeedStockSummary, createFeedStock, updateFeedStock, deleteFeedStock,
  getFeedSchedule, createFeedSchedule, updateFeedSchedule, deleteFeedSchedule,
} = require("../controllers/feedController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);
router.get("/stock/summary", getFeedStockSummary);
router.route("/stock").get(getFeedStock).post(permit("feed", "create"), createFeedStock);
router.route("/stock/:id").put(permit("feed", "update"), updateFeedStock).delete(permit("feed", "remove"), deleteFeedStock);

router.route("/schedule").get(getFeedSchedule).post(permit("feed", "create"), createFeedSchedule);
router.route("/schedule/:id").put(permit("feed", "update"), updateFeedSchedule).delete(permit("feed", "remove"), deleteFeedSchedule);

module.exports = router;
