const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");
const advancedResult = require("../middlewares/advancedResult");
const { protect, authorize } = require("../middlewares/auth");
const Contact = require("../models/contactModel");

const router = require("express").Router();

router
  .route("/")
  .get(protect, authorize("admin"), advancedResult(Contact), getContacts)
  .post(protect, createContact);
router
  .route("/:id")
  .get(protect, authorize("admin"), getContact)
  .put(protect, authorize("admin"), updateContact)
  .delete(protect, authorize("admin"), deleteContact);

module.exports = router;
