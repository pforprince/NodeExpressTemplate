const {
  loginUser,
  registerUser,
  sendOTP,
  disableUser,
  enableUser,
  getAllUsers,
  registerForP2P,
  getAllP2PRequests,
  disableForP2P,
  enableForP2P,
  updateUser,
  getVerificationToken,
  verifyUPIId,
  verifyPAN,
  verifyBank,
} = require("../controllers/userController");
const VerificationMiddleware = require("../middlewares/VerificationMiddleware");

const router = require("express").Router();

router.post("/login", loginUser);
router.post("/", registerUser);
router.get("/token", getVerificationToken);
router.post("/upi", VerificationMiddleware, verifyUPIId);
router.post("/pan", verifyPAN);
router.post("/bank", VerificationMiddleware, verifyBank);

router.use(require("../middlewares/Authenticated"));

router.get("/otp", sendOTP);
router.get("/all", getAllUsers);
router.put("/disable", disableUser);
router.put("/enable", enableUser);
router.put("/bank-details", registerForP2P);
router.get("/all/p2p", getAllP2PRequests);
router.put("/disable/p2p", disableForP2P);
router.put("/enable/p2p", enableForP2P);
router.put("/update", updateUser);

module.exports = router;
