const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.tkn) {
    token = req.cookies.tkn;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const { id } = jwt.verify(token, process.env.J_SECRET);
    const user = await User.findById(id);
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
