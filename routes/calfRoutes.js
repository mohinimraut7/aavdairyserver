const express = require("express");
const router = express.Router();
const {
  getCalves, getCalfById, createCalf, updateCalf, deleteCalf,
} = require("../controllers/calfController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getCalves).post(createCalf);
router.route("/:id").get(getCalfById).put(updateCalf).delete(deleteCalf);

module.exports = router;
