const { model } = require("mongoose");
const { User, Bank } = require("../models/User");
const { handleAsync } = require("../shared/handleAsync");
const { generateToken } = require("../shared/TokenService");
const client = require("twilio")(
  process.env.accountSid,
  process.env.authToken,
  {
    lazyLoading: true,
  }
);

const registerUser = handleAsync(async (req, res) => {
  const { name, email, phoneNo, password, kycOption } = req.body;

  const isEmailExists = await User.findOne({
    email: { $regex: email, $options: "i" },
  });
  if (isEmailExists)
    return res.status(400).json({ message: "User already exists", data: [] });

  const user = new User({ name, email, phoneNo, kycOption, password });
  const savedUser = await user.save();

  if (savedUser) {
    return res.status(200).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid request", data: [] });
});

const loginUser = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  var user = await User.findOne({
    email: { $regex: email, $options: "i" },
  }).select(
    "+password -__v -createdAt -updatedAt -_id -bankDetails -phoneNo -isP2P -status"
  );
  if (user && user.status === "inactive") {
    return res
      .status(403)
      .json({ message: "You can not perform this action", data: [] });
  }
  if (user) {
    if (user && (await user.comparePassword(password))) {
      const token = await generateToken(email);
      user = user.toObject();
      delete user.password;
      return res
        .status(200)
        .json({ message: "Success", data: { user, token } });
    }
  } else
    return res.status(403).json({ message: "Invalid Credentials", data: [] });
});

const sendOTP = handleAsync(async (req, res) => {
  client.messages
    .create({
      body: "Hello from Node",
      to: "+917986616446",
      from: "+917986616446",
    })
    .then((message) => console.log(message))
    // here you can implement your fallback code
    .catch((error) => console.log(error));
});

const enableUser = handleAsync(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (user) {
    user.status = "active";
    const updatedUser = await user.save();
    if (updatedUser)
      return res.status(200).json({ message: "Success", data: [] });
  } else return res.status(400).json({ message: "Invalid user id", data: [] });
});

const disableUser = handleAsync(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (user) {
    user.status = "inactive";
    const updatedUser = await user.save();
    if (updatedUser)
      return res.status(200).json({ message: "Success", data: [] });
  } else return res.status(400).json({ message: "Invalid user id", data: [] });
});

const getAllUsers = handleAsync(async (req, res) => {
  const users = await User.find();
  if (users) {
    return res.status(200).json({ message: "Success", data: users });
  } else return res.status(400).json({ message: "Invalid Request", data: [] });
});

const enableForP2P = handleAsync(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (user) {
    user.isP2P = true;
    const updatedUser = await user.save();
    if (updatedUser)
      return res.status(200).json({ message: "Success", data: [] });
  } else return res.status(400).json({ message: "Invalid user id", data: [] });
});

const disableForP2P = handleAsync(async (req, res) => {
  const { userId } = req.body;
  var user = await User.findById(userId);
  if (user) {
    user.isP2P = false;
    delete user.bank;
    const updatedUser = await user.save();
    if (updatedUser)
      return res.status(200).json({ message: "Success", data: [] });
  } else return res.status(400).json({ message: "Invalid user id", data: [] });
});

const getAllP2PRequests = handleAsync(async (req, res) => {
  const users = await User.find({
    bankDetails: { $exists: true },
  });
  if (users) return res.status(200).json({ message: "Success", data: users });
  else return res.status(400).json({ message: "Invalid Request", data: [] });
});

const registerForP2P = handleAsync(async (req, res) => {
  const { accountHolderName, bankName, ifsc, accountNumber, upiId } = req.body;

  if (!accountHolderName || !bankName || !ifsc || !accountNumber || !upiId) {
    return res
      .status(400)
      .json({ message: "All fields are required", data: [] });
  }

  const bankDetails = new Bank({
    accountHolderName,
    bankName,
    ifsc,
    accountNumber,
    upiId,
  });

  const savedBankDetails = await bankDetails.save();
  if (savedBankDetails) {
    const user = req.user;
    user.bankDetails = savedBankDetails;
    const updateUser = await user.save();
    if (updateUser)
      return res.status(200).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid Request", data: [] });
});
const updateUser = handleAsync(async (req, res) => {
  const { email, walletAddress, privateKey } = req.body;

  if (!email || !walletAddress || !privateKey)
    return res
      .status(400)
      .json({ message: "All fields are required!", data: [] });

  const user = await User.findOne({ email: { $regex: email, $options: "i" } });

  if (!user)
    return res.status(400).json({ message: "Invalid Email Id!", data: [] });

  user.walletAddress = walletAddress;
  user.privateKey = privateKey;
  const updatedUser = await user.save();
  if (updatedUser)
    return res.status(200).json({ message: "Success", data: [] });

  return res.status(400).json({ message: "Invalid Request", data: [] });
});
// const loginUser= handleAsync(async (req, res)=>{})
// const loginUser= handleAsync(async (req, res)=>{})

module.exports = {
  enableUser,
  getAllUsers,
  disableUser,
  updateUser,
  registerUser,
  loginUser,
  sendOTP,
  registerForP2P,
  getAllP2PRequests,
  disableForP2P,
  enableForP2P,
};
