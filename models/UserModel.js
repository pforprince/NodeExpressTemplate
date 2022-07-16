const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  kycOption: {
    enum: ["PAN", "Passport"],
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (rawPassword) {
  return await bcrypt.compare(rawPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
