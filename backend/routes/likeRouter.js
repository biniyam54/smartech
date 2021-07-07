const {
  getLikes,
  addLike,
  addDisLike,
} = require("../controllers/likeController");
const { protect } = require("../middlewares/auth");

const router = require("express").Router({ mergeParams: true });

router.route("/").get(getLikes).post(protect, addLike);
router.route("/dislike").post(protect, addDisLike);

module.exports = router;
