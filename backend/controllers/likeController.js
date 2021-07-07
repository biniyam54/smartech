const asyncHandler = require("../middlewares/asyncHandler");
const Blog = require("../models/blogModel");
const Like = require("../models/likeModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc - get comments for blog
// @route - GET - /api/v1/blog/:blogId/like
// @access - public
exports.getLikes = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(
      new ErrorResponse(`No blog with id of ${req.params.blogId}`, 404)
    );
  }

  const likes = await Like.find({ blog: req.params.blogId })
    .populate("blog", "title image")
    .populate("like", "name email avatar")
    .populate("dislike", "name email avatar");

  res.status(200).json({ likes });
});

// @desc - Like blog
// @route - POST - /api/v1/blog/:blogId/like
// @access - private
exports.addLike = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(
      new ErrorResponse(`No blog with id of ${req.params.blogId}`, 404)
    );
  }

  let likes;

  if ((await Like.findOne({ blog: req.params.blogId })) !== null) {
    likes = await Like.findOne({ blog: req.params.blogId });

    const liked = await likes.like.find(
      (u) => u.toString() === req.user.id.toString()
    );
    const disliked = await likes.dislike.find(
      (u) => u.toString() === req.user.id.toString()
    );

    if (liked) {
      return next(new ErrorResponse("Already liked", 400));
    }

    if (disliked) {
      likes.dislike.pull(req.user.id);
    }

    likes.like.push(req.user.id);
  } else {
    likes = new Like({
      blog: req.params.blogId,
      like: [req.user.id],
      dislike: [],
    });
  }

  await likes.save();

  res.status(200).json({ likes });
});

// @desc - dislike blog
// @route - PUT - /api/v1/blog/:blogId/dislike
// @access - private
exports.addDisLike = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(
      new ErrorResponse(`No blog with id of ${req.params.blogId}`, 404)
    );
  }

  let likes;

  if ((await Like.findOne({ blog: req.params.blogId })) !== null) {
    likes = await Like.findOne({ blog: req.params.blogId });

    const liked = likes.like.find(
      (u) => u.toString() === req.user.id.toString()
    );
    const disliked = likes.dislike.find(
      (u) => u.toString() === req.user.id.toString()
    );

    if (liked) {
      likes.like.pull(req.user.id);
    }

    if (disliked) {
      return next(new ErrorResponse("Already disliked", 400));
    }

    likes.dislike.push(req.user.id);
  } else {
    likes = new Like({
      blog: req.params.blogId,
      like: [],
      dislike: [req.user.id],
    });
  }

  await likes.save();

  res.status(200).json({ likes });
});
