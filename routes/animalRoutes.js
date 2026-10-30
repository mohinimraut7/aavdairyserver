// const express = require("express");
// const router = express.Router();
// const {
//   getAnimals, getAnimalById, createAnimal, updateAnimal, deleteAnimal,
// } = require("../controllers/animalController");
// const { protect } = require("../middlewares/auth");

// router.use(protect);
// router.route("/").get(getAnimals).post(createAnimal);
// router.route("/:id").get(getAnimalById).put(updateAnimal).delete(deleteAnimal);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  getAnimals, getAnimalById, createAnimal, updateAnimal, deleteAnimal,
} = require("../controllers/animalController");
const { protect, permit } = require("../middlewares/auth");

router.use(protect);
router.route("/").get(getAnimals).post(permit("animals", "create"), createAnimal);
router.route("/:id").get(getAnimalById).put(permit("animals", "update"), updateAnimal).delete(permit("animals", "remove"), deleteAnimal);

module.exports = router;