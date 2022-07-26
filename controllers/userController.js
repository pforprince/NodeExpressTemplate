const { default: axios } = require("axios");
const { model } = require("mongoose");
const { User, Bank } = require("../models/User");
const { writeNewToken } = require("../shared/common");
const { handleAsync } = require("../shared/handleAsync");
const { generateToken } = require("../shared/TokenService");
const { BASEURL, BEARER_TOKEN } = require("../shared/Utils");

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

const getVerificationToken = async () => {
  var formData = new URLSearchParams();
  formData.append("client_id", process.env.CLIENT_ID);
  formData.append("client_secret", process.env.CLIENT_SECRET);
  axios
    .post(`${BASEURL}/authorize`, formData)
    .then((response) => {
      writeNewToken(response.data.access_token);
    })
    .catch((e) => {
      console.log(e);
    });
};

const verifyUPIId = handleAsync(async (req, res) => {
  const { upiId } = req.body;
  axios
    .get(`${BASEURL}/verification/upi?vpa=${upiId}`, {
      headers: {
        Authorization: "Bearer " + BEARER_TOKEN,
        "x-api-key": process.env.CLIENT_SECRET,
      },
    })
    .then((response) => {
      if (response.data.data.account_exists)
        return res.status(200).json({
          message: "Success",
          data: { name: response.data.data.name_at_bank },
        });
      else
        return res.status(400).json({
          message: "Upi does not exists",
          data: [],
        });
    })
    .catch(async (e) => {
      if (e.response.status == 403) await getVerificationToken();
      return res.status(400).json({
        message: "Oops! Try again",
        data: [],
      });
    });
});

const verifyPAN = handleAsync(async (req, res) => {
  const { panNumber } = req.body;
  axios
    .get(`${BASEURL}/verification/panbasic?pan_number=${panNumber}`, {
      headers: {
        Authorization: "Bearer " + BEARER_TOKEN,
        "x-api-key": process.env.CLIENT_SECRET,
      },
    })
    .then((response) => {
      return res.status(200).json({
        message: "Success",
        data: { name: response.data.data.full_name },
      });
    })
    .catch(async (e) => {
      if (e.response.status == 403) await getVerificationToken();
      return res.status(400).json({
        message: "Something went wrong. Try again in sometime",
        data: [],
      });
    });
});

const verifyBank = handleAsync(async (req, res) => {
  const { accountNumber, ifsc } = req.body;
  axios
    .get(
      `${BASEURL}/verification/bankaccount?account_number=${accountNumber}&ifsc=${ifsc}`,
      {
        headers: {
          Authorization: "Bearer " + BEARER_TOKEN,
          "x-api-key": process.env.CLIENT_SECRET,
        },
      }
    )
    .then((response) => {
      if (response.data.data.account_exists)
        return res.status(200).json({
          message: "Success",
          data: { name: response.data.data.name_at_bank },
        });
    })
    .catch(async (e) => {
      if (e.response.status == 403) await getVerificationToken();
      return res.status(400).json({
        message: "Oops! Try again",
        data: [],
      });
    });
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
  verifyBank,
  getVerificationToken,
  sendOTP,
  verifyUPIId,
  verifyPAN,
  registerForP2P,
  getAllP2PRequests,
  disableForP2P,
  enableForP2P,
};
