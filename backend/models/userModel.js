const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      minLength: [3, "Name can't be less than 3 characters"],
      maxLength: [50, "Name can't be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      minLength: [6, "Password should be at least 6 character"],
      required: [true, "Please add password"],
      select: false,
    },
    avatar: {
      type: String,
      default: "no-avatar.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "tester", "publisher"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
    },
    birthdate: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyEmailToken: String,
    verifyEmailExpire: Date,
  },
  {
    timestamps: true,
  }
);

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// check password
userSchema.methods.matchPassword = async function (p_) {
  return await bcrypt.compare(p_, this.password);
};

// generate jwt token with id
userSchema.methods.genAuthToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.J_SECRET, {
    expiresIn: process.env.J_EXP,
  });

  return token;
};

// generate resettoken
userSchema.methods.genResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  const tokenExtend = crypto.randomBytes(32).toString("hex");

  const tokenCombine = `${token}.${tokenExtend}`;

  return tokenCombine;
};

// generate confirmtoken
userSchema.methods.genVerifyToken = function () {
  const token = crypto.randomBytes(40).toString("hex");

  this.verifyEmailToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.verifyEmailExpire = Date.now() + 10 * 60 * 1000;

  const tokenExtend = crypto.randomBytes(32).toString("hex");

  const tokenCombine = `${token}.${tokenExtend}`;

  return tokenCombine;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
