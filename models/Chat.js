const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        receiverId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        message: {
          type: String,
          required: true,
        },
        sendAt: {
          type: Date,
          required: true,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };
