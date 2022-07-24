const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const bankSchema = mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
    },
    ifsc: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    upiId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      required: false,
    },
    privateKey: {
      type: String,
      required: false,
    },
    kycOption: {
      enum: ["PAN", "Passport"],
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
      required: true,
    },
    isP2P: {
      type: Boolean,
      default: false,
      required: true,
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bank",
    },
  },
  {
    timestamps: true,
  }
);

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
const Bank = mongoose.model("Bank", bankSchema);
module.exports = { User, Bank };
