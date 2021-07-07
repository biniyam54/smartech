const router = require("express").Router();
const {
  register,
  login,
  getMe,
  logout,
  updateMe,
  changeAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  confirmEmail,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(protect, getMe);
router.route("/me/update").put(protect, updateMe);
router.route("/me/avatar").put(protect, changeAvatar);
router.route("/me/update/password").put(protect, changePassword);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);
router.route("/verifyemail").post(protect, verifyEmail);
router.route("/confirmemail").put(confirmEmail);

module.exports = router;
