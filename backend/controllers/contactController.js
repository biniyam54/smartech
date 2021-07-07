const asyncHandler = require("../middlewares/asyncHandler");
const Contact = require("../models/contactModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc - Get contacts
// @route - GET - /api/v1/contact
// @access - private/admin
exports.createContact = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const contact = await Contact.create(req.body);

  res.status(201).json({ contact });
});

// @desc - Get contacts
// @route - GET - /api/v1/contact
// @access - private/admin
exports.getContacts = asyncHandler(async (req, res, next) => {
  const { page, pages, count, query } = res.result;
  const contacts = await query.populate("user", "name email avatar");

  res.status(200).json({ contacts, page, pages, count });
});

// @desc - Get contact
// @route - GET - /api/v1/contact/:id
// @access - private/admin
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id).populate(
    "user",
    "name email avatar"
  );

  if (!contact) {
    return next(
      new ErrorResponse(
        `No user contact info found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ contact });
});

// @desc - Update contact
// @route - PUT - /api/v1/contact/:id
// @access - private/admin
exports.updateContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(
      new ErrorResponse(
        `No user contact info found with id of ${req.params.id}`,
        404
      )
    );
  }

  contact.msg = req.body.msg || contact.msg;
  await contact.save();

  res.status(200).json({ contact });
});

// @desc - Delete contact
// @route - DELETE - /api/v1/contact/:id
// @access - private/admin
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(
      new ErrorResponse(
        `No user contact info found with id of ${req.params.id}`,
        404
      )
    );
  }

  await contact.remove();

  res.status(200).json({ contact: {} });
});
