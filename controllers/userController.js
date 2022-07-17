const { model } = require("mongoose");
const { User } = require("../models/User");
const { handleAsync } = require("../shared/handleAsync");
const client = require("twilio")(
  process.env.accountSid,
  process.env.authToken,
  {
    lazyLoading: true,
  }
);

const registerUser = handleAsync(async (req, res) => {
  const { name, email, phoneNo, password, kycOption } = req.body;

  const isEmailExists = await User.findOne({ email });
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

  var user = await User.findOne({ email }).select(
    "+password -__v -createdAt -updatedAt -_id"
  );
  if (user && user.status === "inactive") {
    return res
      .status(403)
      .json({ message: "You can not perform this action", data: [] });
  }
  if (user) {
    if (user && (await user.comparePassword(password))) {
      //   const token = await generateToken(email);
      user = user.toObject();
      delete user.password;
      // delete user.updatedAt;
      // delete user.__v;
      // delete user._id;
      // delete user.createdAt;

      return res.status(200).json({ message: "Success", data: user });
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
// const loginUser= handleAsync(async (req, res)=>{})

module.exports = {
  enableUser,
  getAllUsers,
  disableUser,
  registerUser,
  getAllUsers,
  loginUser,
  sendOTP,
};
