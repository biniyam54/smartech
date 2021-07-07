const router = require("express").Router({ mergeParams: true });
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const advancedResult = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");
const Comment = require("../models/commentModel");

router
  .route("/")
  .get(advancedResult(Comment), getComments)
  .post(protect, createComment);
router
  .route("/:id")
  .get(getComment)
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
