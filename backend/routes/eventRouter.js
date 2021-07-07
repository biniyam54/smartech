const {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const advancedResult = require("../middlewares/advancedResult");
const { protect, authorize } = require("../middlewares/auth");
const Event = require("../models/eventModel");

const router = require("express").Router();

router
  .route("/")
  .get(advancedResult(Event), getEvents)
  .post(protect, authorize("admin"), createEvent);
router
  .route("/:slug")
  .get(getEvent)
  .put(protect, authorize("admin"), updateEvent)
  .delete(protect, authorize("admin"), deleteEvent);

module.exports = router;
