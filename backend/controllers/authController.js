const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const fs = require("fs");

// @desc - Register new user
// @route - POST - /api/v1/auth/register
// @access - public
exports.register = asyncHandler(async (req, res, next) => {
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

  sendTokenResponse(res, user, 201);
});

// @desc - Login user
// @route - POST - /api/v1/auth/login
// @access - public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid email or password", 400));
  }

  if (!(await user.matchPassword(password))) {
    return next(new ErrorResponse("Invalid email or password", 400));
  }

  sendTokenResponse(res, user, 200);
});

// @desc - Logout
// @route - GET - /api/v1/auth/logout
// @access - public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("tkn", "none", {
    expires: new Date(Date.now() + 10 * 100),
    httpOnly: true,
  });

  res.status(200).json({
    user: {},
  });
});

// @desc - Get me
// @route - GET - /api/v1/auth/me
// @access - private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    user,
  });
});

// @desc - Update
// @route - PUT - /api/v1/auth/me/update
// @access - private
exports.updateMe = asyncHandler(async (req, res, next) => {
  const { name, email, gender, birthday } = req.body;
  const user = await User.findById(req.user.id);

  user.name = name || user.name;
  user.email = email || user.email;
  user.gender = gender || user.gender;
  user.birthday = birthday || user.birthday;

  await user.save();

  res.status(200).json({
    ok: true,
  });
});

// @desc - Update avatar
// @route - PUT - /api/v1/auth/me/avatar
// @access - private
exports.changeAvatar = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse("Please choose image for your avatar", 400));
  }
  const file = req.files.file;

  file.name = `uploads/avatars/avatar_${Date.now()}_${file.name}`;

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
  if (file.size > process.env.AVATAR_SIZE) {
    return next(
      new ErrorResponse(
        "file size exceed the limit, maximum size is 1 mb only",
        400
      )
    );
  }

  const user = await User.findById(req.user.id);

  file.mv(`${process.env.FILE_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(
        new ErrorResponse("We're sorry. failed to upload an image", 500)
      );
    }

    if (
      user.avatar !== "no-avatar.png" &&
      user.avatar.startsWith("uploads/avatar")
    ) {
      if (fs.existsSync(`${process.env.FILE_PATH}/${user.avatar}`)) {
        fs.unlinkSync(`${process.env.FILE_PATH}/${user.avatar}`);
      }
    }

    user.avatar = file.name;

    await user.save();

    res.status(200).json({
      ok: true,
    });
  });
});

// @desc - Update password
// @route - PUT - /api/v1/auth/me/update/password
// @access - private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorResponse("Please provide in all fields", 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(oldPassword))) {
    return next(new ErrorResponse("Incorrect password", 400));
  }

  user.password = newPassword;

  await user.save();

  sendTokenResponse(res, user, 200);
});

// @desc - Forgot password
// @route - POST - /api/v1/auth/forgotpassword
// @access - public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(
      new ErrorResponse(`Please enter email to forgot password`, 400)
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(`${email} is not found`, 404));
  }

  const resettoken = await user.genResetToken();

  const resetUri = `${req.get("host")}/api/v1/auth/resetpassword/${resettoken}`;

  const message = `Hello there, You are receiving this because of you or someone else tried to forgot your password, if this is you please click the link below \n\n ${resetUri} \n\n if this is not you please don't forget to report`;

  try {
    await sendEmail({ email, subject: "Forgot password", message });
    return res.status(200).json({
      ok: true,
      msg: `Token sent to ${email}, please check your email`,
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("We're sorry, failed to send email", 500));
  }
});

// @desc - Reset password
// @route - PUT - /api/v1/auth/resetpassword/:resettoken
// @access - public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const tokenCombine = req.params.resettoken;

  const bytetoken = tokenCombine.split(".")[0];

  const resetToken = crypto
    .createHash("sha256")
    .update(bytetoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gte: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid or expired reset token", 400));
  }

  if (!req.body.password) {
    return next(new ErrorResponse("Please set new password", 400));
  }

  user.password = req.body.password;

  await user.save();

  sendTokenResponse(res, user, 200);
});

// @desc - Verify email
// @route - POST - /api/v1/auth/verifyemail
// @access - private
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.isVerfied) {
    return next(new ErrorResponse("You are already verified", 400));
  }

  const verifyToken = await user.genVerifyToken();

  const verifyUri = `${req.get("host")}/api/v1/auth/verifytoken/${verifyToken}`;

  const message = `Hello ${user.name}, we are sending this because you need to confirm your email, please click on the link below to verify \n\n ${verifyUri}`;

  try {
    await sendEmail({ email: user.email, subject: "Verify email", message });
    res.status(200).json({
      ok: true,
      msg: `Email sent to ${user.email}, please check your email`,
    });
  } catch (err) {
    console.log(err);
    user.verifyEmailToken = undefined;
    user.verifyEmailExpire = undefined;

    await user.save();

    return next(new ErrorResponse("We're sorry, failed to send email", 400));
  }
});

// @desc - Confirm email
// @route - PUT - /api/v1/auth/confirmemail?verifytoken=_
// @access - public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new ErrorResponse("Invalid or expired token", 400));
  }

  const byteToken = token.split(".")[0];

  const verifyToken = crypto
    .createHash("sha256")
    .update(byteToken)
    .digest("hex");

  const user = await User.findOne({
    verifyEmailToken: verifyToken,
    verifyEmailExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid or expired token", 400));
  }

  user.isVerified = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailExpire = undefined;

  await user.save();

  sendTokenResponse(res, user, 200);
});

const sendTokenResponse = async (res, model, status) => {
  const token = await model.genAuthToken();

  const options = {
    expires: new Date(Date.now() + process.env.C_EXP * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.cookie("tkn", token, options).status(status).json({
    ok: true,
  });
};
