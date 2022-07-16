const {
  loginUser,
  registerUser,
  sendOTP,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", loginUser);
router.post("/", registerUser);
router.get("/otp", sendOTP);

module.exports = router;
