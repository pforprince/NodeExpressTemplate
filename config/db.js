const mongoose = require("mongoose");

const connection = async () => {
  try {
    mongoose
      .connect(process.env.MONGOURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then(() => {
        console.log("Mongoose connected");
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connection;
