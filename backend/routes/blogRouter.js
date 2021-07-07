const router = require("express").Router();
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect, authorize } = require("../middlewares/auth");
const Blog = require("../models/blogModel");
const advancedResult = require("../middlewares/advancedResult");

// reroute
const commentRouter = require("../routes/commentRouter");
const likeRouter = require("../routes/likeRouter");

router.use("/:blogId/comment", commentRouter);
router.use("/:blogId/like", likeRouter);
// router.use("/:blogId/dislike", likeRouter);

router
  .route("/")
  .get(advancedResult(Blog), getBlogs)
  .post(protect, authorize("admin"), createBlog);
router
  .route("/:slug")
  .get(getBlog)
  .put(protect, authorize("admin"), updateBlog)
  .delete(protect, authorize("admin", "publisher"), deleteBlog);

module.exports = router;
