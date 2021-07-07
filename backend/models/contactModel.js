const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    msg: {
      type: String,
      required: [true, "Please write message"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
