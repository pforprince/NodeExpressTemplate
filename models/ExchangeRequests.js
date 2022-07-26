const mongoose = require("mongoose");

const exchangeRequests = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    currency: {
      type: String,
      enum: ["usd", "usdt", "bnb"],
      required: true,
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ["gpay", "imps", "phonepay", "real time meet"],
      required: true,
      lowercase: true,
    },
    action: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
      lowercase: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExchangeRequests = mongoose.model("ExchangeRequests", exchangeRequests);
module.exports = { ExchangeRequests };
