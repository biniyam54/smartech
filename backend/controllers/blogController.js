const fs = require("fs");
const asyncHandler = require("../middlewares/asyncHandler");
const Blog = require("../models/blogModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc - Get all blogs
// @route - GET - /api/v1/blog
// @access - public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const { page, pages, count, query } = res.result;
  const blogs = await query
    .populate({
      path: "comments",
      populate: { path: "user", select: "name avatar" },
    })
    .populate({
      path: "likes",
      populate: { path: "like", select: "name avatar" },
      populate: { path: "dislike", select: "name avatar" },
    })
    .populate("user", "name avatar");

  res.status(200).json({ blogs, page, pages, count });
});

// @desc - Get blog by slug
// @route - POST - /api/v1/blog/:slug
// @access - public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate("comments")
    .populate("user");

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with ${req.params.slug}`));
  }

  res.status(200).json({
    blog,
  });
});

// @desc - Get Update
// @route - POST - /api/v1/blog/:slug
// @access - private/admin
exports.updateBlog = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  const blog = await Blog.findOne({ slug: req.params.slug });

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with ${req.params.slug}`));
  }

  blog.title = title || blog.title;
  blog.description = description || blog.description;

  if (req.files && req.files.file) {
    const file = req.files.file;

    file.name = `uploads/blogs/blog_${Date.now()}_${file.name}`;

    // check file type
    if (!file.mimetype.startsWith("image")) {
      return next(
        new ErrorResponse(
          `${file.mimetype} is not supported, please upload image only`,
          400
        )
      );
    }

    // check file size
    if (file.size > process.env.BLOG_SIZE) {
      return next(
        new ErrorResponse(
          "file size exceed the limit, maximum size is 3 mb only",
          400
        )
      );
    }

    // move file to folder
    file.mv(`${process.env.FILE_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.log(err);
        return next(
          new ErrorResponse("We're sorry, failed to upload image", 500)
        );
      }

      const oldImage = blog.image;

      if (fs.existsSync(`${process.env.FILE_PATH}/${oldImage}`)) {
        fs.unlinkSync(`${process.env.FILE_PATH}/${oldImage}`);
      }

      // blog.image = file.name;
      blog.update({ image: file.name });
    });
  }

  await blog.save();

  return res.status(201).json({
    blog,
  });
});

// @desc - Create new blog
// @route - POST - /api/v1/blog
// @access - private/admin
exports.createBlog = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const { title, description, user } = req.body;

  const blog = await Blog.create({
    title,
    description,
    user,
  });

  if (req.files && req.files.file) {
    const file = req.files.file;

    file.name = `uploads/blogs/blog_${Date.now()}_${file.name}`;

    // check file type
    if (!file.mimetype.startsWith("image")) {
      return next(
        new ErrorResponse(
          `${file.mimetype} is not supported, please upload image only`,
          400
        )
      );
    }

    // check file size
    if (file.size > process.env.BLOG_SIZE) {
      return next(
        new ErrorResponse(
          "file size exceed the limit, maximum size is 3 mb only",
          400
        )
      );
    }

    file.mv(`${process.env.FILE_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.log(err);
        return next(
          new ErrorResponse("We're sorry, failed to upload image", 500)
        );
      }

      await blog.update({ image: file.name });
    });
  }

  res.status(201).json({
    blog,
  });
});

// @desc - Get Update
// @route - POST - /api/v1/blog/:slug
// @access - private/admin
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug });

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with ${req.params.slug}`));
  }

  if (req.user.role !== "admin" && req.user.id !== blog.userId) {
    return next(new ErrorResponse("Not auhtorized to access this route", 401));
  }

  await blog.remove();

  return res.status(201).json({
    blog: {},
  });
});
