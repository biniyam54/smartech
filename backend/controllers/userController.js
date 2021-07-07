const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

// @desc - get all user
// @route - GET - /api/v1/user
// @access - private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { query, page, pages, count } = res.result;
  const users = await query;

  res.status(200).json({ users, page, pages, count });
});

// @desc - get single user
// @route - GET - /api/v1/user/:id
// @access - private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`No user with id of ${req.params.id}`));
  }

  res.status(200).json({ user });
});

// @desc - Update user
// @route - PUT - /api/v1/user/:id
// @access - private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`No user with id of ${req.params.id}`));
  }

  const { name, email, gender, birthday } = req.body;

  user.name = name || user.name;
  user.email = email || user.email;
  user.gender = gender || user.gender;
  user.birthday = birthday || user.birthday;

  await user.save();

  res.status(200).json({
    user,
  });
});

// @desc - Delete user
// @route - DELETE - /api/v1/user/:id
// @access - private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`No user with id of ${req.params.id}`));
  }

  await user.remove();

  res.status(200).json({
    user: {},
  });
});

// @desc - Create user
// @route - POST - /api/v1/user
// @access - private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existEmail = await User.findOne({ email });

  if (existEmail) {
    return next(
      new ErrorResponse(
        `${email} is already registered, pls choose different`,
        400
      )
    );
  }

  const user = await User.create({ name, email, password });

  const verifyToken = await user.genVerifyToken();

  const verifyUri = `${req.get("host")}/api/v1/auth/verifytoken/${verifyToken}`;

  const message = `Hello ${user.name}, we are sending this because u need to confirm email, please click on the link below \n\n ${verifyUri}`;

  await sendEmail({ email: user.email, subject: "Verify email", message });

  res.status(201).json({ user });
});
