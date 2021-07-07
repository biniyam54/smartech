const asyncHandler = require("../middlewares/asyncHandler");
const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc - get comments for blog
// @route - GET - /api/v1/blog/:blogId/comments
// @access - public
exports.getComments = asyncHandler(async (req, res, next) => {
  const { query, page, pages, count } = res.result;
  if (req.params.blogId) {
    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      return next(
        new ErrorResponse(`No blog with id of ${req.params.blogId}`, 404)
      );
    }

    const comments = await Comment.find({ blog: req.params.blogId })
      .populate("blog", "title image")
      .populate("user", "name email avatar");

    res.status(200).json({ comments });
  } else {
    const comments = await query
      .populate("blog", "title image")
      .populate("user", "name email avatar");
    res.status(200).json({ comments, page, pages, count });
  }
});

// @desc - get comment
// @route - GET - /api/v1/comment/:id
// @access - public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ comment });
});

// @desc - Write comment
// @route - POST - /api/v1/blog/:blogId/comment
// @access - private
exports.createComment = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.blog = req.params.blogId;

  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404)
    );
  }
  const comment = await Comment.create(req.body);
  res.status(200).json({ comment });
});

// @desc - Update comment
// @route - PUT - /api/v1/comment/:id
// @access - private/owner/admin
exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== "admin" && comment.user !== req.user.id) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  comment.text = req.body.text || comment.text;

  await comment.save();

  res.status(200).json({ comment });
});

// @desc - Delete comment
// @route - DELETE - /api/v1/comment/:id
// @access - private/owner/admin
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== "admin" && comment.user !== req.user.id) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  await comment.remove();

  res.status(200).json({ comment: {} });
});
