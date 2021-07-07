const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDb = require("./configs/db");
const fileupload = require("express-fileupload");
const { notFound, errorHandler } = require("./middlewares/errorHanlder");
const cookieParser = require("cookie-parser");

// routes
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const commentRouter = require("./routes/commentRouter");
const contactRouter = require("./routes/contactRouter");
const feedbackRouter = require("./routes/feedbackRouter");
const eventRouter = require("./routes/eventRouter");
const morgan = require("morgan");

// env vars
dotenv.config();

// connect db
connectDb();

const app = express();

// body parser
app.use(express.json());
app.use(cookieParser());
app.use(fileupload());

// morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/event", eventRouter);

// error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.cyan.bold
  )
);
