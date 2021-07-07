const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const con = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(`Db connected : ${con.connection.host}`.yellow.bold);
  } catch (err) {
    console.log(`Error : ${err}`.red);
  }
};

module.exports = connectDb;
