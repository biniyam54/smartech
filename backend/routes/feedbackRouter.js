const {
  getFeedbacks,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");
const advancedResult = require("../middlewares/advancedResult");
const { protect, authorize } = require("../middlewares/auth");
const Feedback = require("../models/feedbackModel");

const router = require("express").Router();

router
  .route("/")
  .get(protect, authorize("admin"), advancedResult(Feedback), getFeedbacks)
  .post(protect, createFeedback);
router
  .route("/:id")
  .get(protect, authorize("admin"), getFeedback)
  .put(protect, authorize("admin"), updateFeedback)
  .delete(protect, authorize("admin"), deleteFeedback);

module.exports = router;
