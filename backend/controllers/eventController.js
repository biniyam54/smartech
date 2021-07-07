const fs = require("fs");
const asyncHandler = require("../middlewares/asyncHandler");
const Event = require("../models/eventModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc - Get events
// @route - Get - /api/v1/event
// @access - public
exports.getEvents = asyncHandler(async (req, res, next) => {
  const { page, pages, count, query } = res.result;
  const events = await query;

  res.status(200).json({ events, page, pages, count });
});

// @desc - Get event
// @route - GET - /api/v1/event/:slug
// @access - public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug });

  if (!event) {
    return next(
      new ErrorResponse(`No event found with slug of ${req.params.slug}`, 404)
    );
  }

  res.status(200).json({ event });
});

// @desc - Create event
// @route - POST - /api/v1/event
// @access - private/admin
exports.createEvent = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
  } = req.body;

  const event = await Event.create({
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
  });

  if (req.files && (req.files.image || req.files.cover)) {
    console.log(req.files);
    const { image, cover } = req.files;

    // check file type
    if (
      (image && !image.mimetype.startsWith("image")) ||
      (cover && !cover.mimetype.startsWith("image"))
    ) {
      return next(
        new ErrorResponse(
          `${
            (!image.mimetype.startsWith("image") && image.mimetype) ||
            (!cover.mimetype.startsWith("image") && cover.mimetype)
          } is not supported, please upload image only`,
          400
        )
      );
    }

    // check file size
    if (
      (image && image.size > process.env.EVENT_SIZE) ||
      (cover && cover.size > process.env.EVENT_SIZE)
    ) {
      return next(
        new ErrorResponse(
          "file size exceed the limit, maximum size is 3 mb only",
          400
        )
      );
    }

    if (image) {
      image.name = `uploads/events/image_${Date.now()}_${image.name}`;

      // move image into event images forder
      image.mv(`${process.env.FILE_PATH}/${image.name}`, async (err) => {
        if (err) {
          console.log(err);
          return next(
            new ErrorResponse("We're sorry, failed to upload image", 500)
          );
        }

        event.image = image.name;
        await event.update({ image: image.name });
      });
    }

    if (cover) {
      cover.name = `uploads/events/cover_${Date.now()}_${cover.name}`;

      //    move image into event images forder
      cover.mv(`${process.env.FILE_PATH}/${cover.name}`, async (err) => {
        if (err) {
          console.log(err);
          return next(
            new ErrorResponse("We're sorry, failed to upload image", 500)
          );
        }

        await event.update({ cover: cover.name });
      });
    }
  }

  // await event.save();

  res.status(201).json({ event });
});

// @desc - Update event
// @route - PUT - /api/v1/event/:slug
// @access - private/admin
exports.updateEvent = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
  } = req.body;

  const event = await Event.findOne({ slug: req.params.slug });

  if (!event) {
    return next(
      new ErrorResponse(`No event with slug of ${req.params.slug}`, 404)
    );
  }

  event.title = title || event.title;
  event.description = description || event.description;
  event.startDate = startDate || event.startDate;
  event.startTime = startTime || event.startTime;
  event.endDate = endDate || event.endDate;
  event.endTime = endTime || event.endTime;
  event.location = location || event.location;

  if (req.files && (req.files.image || req.files.cover)) {
    console.log(req.files);
    const { image, cover } = req.files;

    // check file type
    if (
      (image && !image.mimetype.startsWith("image")) ||
      (cover && !cover.mimetype.startsWith("image"))
    ) {
      return next(
        new ErrorResponse(
          `${
            (!image.mimetype.startsWith("image") && image.mimetype) ||
            (!cover.mimetype.startsWith("image") && cover.mimetype)
          } is not supported, please upload image only`,
          400
        )
      );
    }

    // check file size
    if (
      (image && image.size > process.env.EVENT_SIZE) ||
      (cover && cover.size > process.env.EVENT_SIZE)
    ) {
      return next(
        new ErrorResponse(
          "file size exceed the limit, maximum size is 3 mb only",
          400
        )
      );
    }

    if (image) {
      image.name = `uploads/events/image_${Date.now()}_${image.name}`;

      // move image into event images forder
      image.mv(`${process.env.FILE_PATH}/${image.name}`, async (err) => {
        if (err) {
          console.log(err);
          return next(
            new ErrorResponse("We're sorry, failed to upload image", 500)
          );
        }

        if (fs.existsSync(`${process.env.FILE_PATH}/${event.image}`)) {
          fs.unlinkSync(`${process.env.FILE_PATH}/${event.image}`);
        }

        await event.update({ image: image.name });
      });
    }

    if (cover) {
      cover.name = `uploads/events/cover_${Date.now()}_${cover.name}`;

      //    move image into event images forder
      cover.mv(`${process.env.FILE_PATH}/${cover.name}`, async (err) => {
        if (err) {
          console.log(err);
          return next(
            new ErrorResponse("We're sorry, failed to upload image", 500)
          );
        }

        if (fs.existsSync(`${process.env.FILE_PATH}/${event.cover}`)) {
          fs.unlinkSync(`${process.env.FILE_PATH}/${event.cover}`);
        }

        await event.update({ cover: cover.name });
      });
    }
  }

  res.status(201).json({ event });
});

// @desc - Delete event
// @route - DELETE - /api/v1/event/:slug
// @access - private/admin
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug });

  if (!event) {
    return next(new ErrorResponse(`No event with slug of ${req.params.slug}`));
  }

  await event.remove();

  res.status(200).json({ event: {} });
});
