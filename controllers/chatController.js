const { Chat } = require("../models/Chat");
const { handleAsync } = require("../shared/handleAsync");

const sendMessage = handleAsync(async (req, res) => {
  const { message, receiverId } = req.body;

  const chatExists = await Chat.findOne({
    members: { $all: [req.user._id, receiverId] },
  });

  if (chatExists) {
    chatExists.messages.push({
      message,
      senderId: req.user._id,
      receiverId,
    });

    const updatedChat = await chatExists.save();
    if (updatedChat)
      return res.status(200).json({ message: "Success", data: [] });
  } else {
    const chat = new Chat({
      members: [req.user._id, receiverId],
      messages: [
        {
          message,
          senderId: req.user._id,
          receiverId,
        },
      ],
    });

    const savedChat = await chat.save();

    if (savedChat)
      return res.status(200).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid request", data: [] });
});

const getMyChats = handleAsync(async (req, res) => {
  const chats = await Chat.find({
    members: { $all: [req.user._id] },
  })
    .populate([
      { path: "members", select: "name" },
      { path: "senderId", select: "name" },
      { path: "receiverId", select: "name" },
    ])
    .sort("-updatedAt");

  if (chats) return res.status(200).json({ message: "Success", data: chats });
  return res.status(400).json({ message: "Invalid request", data: [] });
});

const getMessages = handleAsync(async (req, res) => {
  const { userId } = req.params;

  const chatExists = await Chat.findOne({
    members: { $all: [req.user._id, userId] },
  });
  if (chatExists)
    return res.status(200).json({ message: "Success", data: chatExists });
  else return res.status(400).json({ message: "No chat found", data: [] });
});

// const loginUser= handleAsync(async (req, res)=>{})
// const loginUser= handleAsync(async (req, res)=>{})

module.exports = { sendMessage, getMyChats, getMessages };
