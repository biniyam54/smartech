const asyncHandler = require("../middlewares/asyncHandler");
const Feedback = require("../models/feedbackModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc - create feedbacks
// @route - GET - /api/v1/feedback
// @access - private/admin
exports.createFeedback = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const feedback = await Feedback.create(req.body);

  res.status(201).json({ feedback });
});

// @desc - Get feedbacks
// @route - GET - /api/v1/feedback
// @access - private/admin
exports.getFeedbacks = asyncHandler(async (req, res, next) => {
  const { page, pages, count, query } = res.result;

  const feedbacks = await query.populate("user", "name email avatar");

  res.status(200).json({ feedbacks, page, pages, count });
});

// @desc - Get feedback
// @route - GET - /api/v1/feedback/:id
// @access - private/admin
exports.getFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id).populate(
    "user",
    "name email avatar"
  );

  if (!feedback) {
    return next(
      new ErrorResponse(
        `No user feedback found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ feedback });
});

// @desc - Update feedback
// @route - PUT - /api/v1/feedback/:id
// @access - private/admin
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(
        `No user feedback found with id of ${req.params.id}`,
        404
      )
    );
  }

  feedback.feedback = req.body.feedback || feedback.feedback;
  feedback.status = req.body.status || feedback.status;

  await feedback.save();

  res.status(200).json({ feedback });
});

// @desc - Delete feedback
// @route - DELETE - /api/v1/feedback/:id
// @access - private/admin
exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(
        `No user feedback found with id of ${req.params.id}`,
        404
      )
    );
  }

  await feedback.remove();

  res.status(200).json({ feedback: {} });
});
