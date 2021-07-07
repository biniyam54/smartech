const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add title"],
      minLength: [5, "Title can't be less than 3 characters"],
      maxLength: [100, "Title can't be more than 100 characters"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add description"],
    },
    image: {
      type: String,
      required: true,
      default: "no-blog-image.png",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

blogSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "blog",
  localField: "_id",
  justOne: false,
});

blogSchema.virtual("likes", {
  ref: "Like",
  foreignField: "blog",
  localField: "_id",
  justOne: false,
});

blogSchema.pre("remove", async function (next) {
  console.log(`Deleting contents related with blog ${this.slug}`);
  await this.model("Comment").deleteMany({ blog: this._id });
  await this.model("Like").deleteMany({ blog: this._id });
  next();
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
