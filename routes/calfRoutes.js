// const express = require("express");
// const router = express.Router();
// const {
//   getCalves, getCalfById, createCalf, updateCalf, deleteCalf,
// } = require("../controllers/calfController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);
// router.route("/").get(getCalves).post(createCalf);
// router.route("/:id").get(getCalfById).put(updateCalf).delete(deleteCalf);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  getCalves, getCalfById, createCalf, updateCalf, deleteCalf,
} = require("../controllers/calfController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getCalves).post(permit("calves", "create"), createCalf);
router.route("/:id").get(getCalfById).put(permit("calves", "update"), updateCalf).delete(permit("calves", "remove"), deleteCalf);

module.exports = router;
