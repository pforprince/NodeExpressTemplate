const {
  getMyChats,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

const router = require("express").Router();

router.use(require("../middlewares/Authenticated"));

router.get("/all", getMyChats);
router.get("/:userId", getMessages);
router.post("/send", sendMessage);

module.exports = router;
