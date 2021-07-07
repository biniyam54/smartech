const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const advancedResult = require("../middlewares/advancedResult");
const { protect, authorize } = require("../middlewares/auth");
const User = require("../models/userModel");

const router = require("express").Router();

router
  .route("/")
  .get(protect, authorize("admin"), advancedResult(User), getUsers)
  .post(protect, authorize("admin"), createUser);
router
  .route("/:id")
  .get(protect, authorize("admin"), getUser)
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
