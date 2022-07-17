const {
  loginUser,
  registerUser,
  sendOTP,
  disableUser,
  enableUser,
  getAllUsers,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", loginUser);
router.post("/", registerUser);
router.get("/otp", sendOTP);
router.get("/all", getAllUsers);
router.put("/disable", disableUser);
router.put("/enable", enableUser);

module.exports = router;
