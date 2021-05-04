const mongoose = require("mongoose");

const connection = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Mongoose connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connection;
