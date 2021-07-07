const slugify = require("slugify");
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add title"],
      unique: [true, "Duplicate field value entered"],
    },
    description: {
      type: String,
      required: [true, "Please add description"],
    },
    image: {
      type: String,
      default: "no-event-image.png",
    },
    cover: {
      type: String,
      default: "no-event-cover.png",
    },
    startDate: {
      type: Date,
      required: [true, "Please set start date"],
    },
    startTime: {
      type: Date,
      required: [true, "Please set start time"],
    },
    endDate: {
      type: Date,
      required: [true, "Please set end date"],
    },
    endTime: {
      type: Date,
      required: [true, "Please set end time"],
    },
    location: {
      address: String,
      link: String,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.pre("save", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
