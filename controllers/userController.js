const { default: axios } = require("axios");
const { User, Bank } = require("../models/User");
const { handleAsync } = require("../shared/handleAsync");
const { generateToken } = require("../shared/TokenService");
const { transporter, mailOptions } = require("../shared/Transporter");
const { BASEURL } = require("../shared/Utils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const client = require("twilio")(
  process.env.accountSid,
  process.env.authToken,
  {
    lazyLoading: true,
  }
);

const registerUser = handleAsync(async (req, res) => {
  const { name, email, phoneNo, password, kycOption, referralCode } = req.body;

  const isEmailExists = await User.findOne({
    email: { $regex: email, $options: "i" },
  });
  if (isEmailExists)
    return res.status(400).json({ message: "User already exists", data: [] });

  const isPhoneExists = await User.findOne({
    phoneNo: { $regex: phoneNo, $options: "i" },
  });
  if (isPhoneExists)
    return res.status(400).json({ message: "User already exists", data: [] });

  const user = new User({
    name,
    email,
    phoneNo,
    kycOption,
    password,
    referralCode,
    referCode: Math.random().toString(36).slice(2, 9),
  });
  const savedUser = await user.save();

  if (savedUser) {
    transporter.sendMail(mailOptions({ email }), function (err, data) {
      if (err) {
        console.log("Error " + err);
      }
    });
    return res.status(200).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid request", data: [] });
});

const loginUser = handleAsync(async (req, res) => {
  const { email, password, phoneNo } = req.body;
  var user;
  if (email) {
    user = await User.findOne({
      email: { $regex: email, $options: "i" },
    }).select(
      "+password -__v -createdAt -updatedAt -bankDetails -phoneNo -isP2P -status"
    );
  } else if (phoneNo) {
    user = await User.findOne({
      phoneNo: { $regex: phoneNo, $options: "i" },
    }).select(
      "+password -__v -createdAt -updatedAt -bankDetails -phoneNo -isP2P -status"
    );
  }
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
  }
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
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhh");
      console.log(response.data.access_token);
      //  writeNewToken(response.data.access_token);
      return response.data.access_token;
    })
    .catch((e) => {
      console.log(e);
    });
  return null;
};

const verifyUPIId = handleAsync(async (req, res) => {
  console.log("upiiiiiiiiiiiii", req.session);

  const { upiId } = req.body;
  console.log(req.session);
  // req.session.token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsaXZlX2RpZ2l0YWxvbmVib3giLCJleHAiOjE2NTg5NDc2NzB9.gFz2tT66Lguc2sZqEqh-L-KoGv5kV45_F9Ng8h0yAJQ";
  axios
    .get(`${BASEURL}/verification/upi?vpa=${upiId}`, {
      headers: {
        Authorization: "Bearer " + req.session?.token,
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
      // if (e.response.status == 403) await getVerificationToken();
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
        Authorization: "Bearer " + req.session?.token,
        "x-api-key": process.env.CLIENT_SECRET,
      },
    })
    .then((response) => {
      if (response.data?.data?.full_name)
        return res.status(200).json({
          message: "Success",
          data: { name: response.data.data.full_name },
        });
      else
        return res.status(400).json({
          message: "PAN Number not exists",
          data: [],
        });
    })
    .catch(async (e) => {
      console.log(e);
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
          Authorization: "Bearer " + req.session.token,
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
      return res.status(400).json({
        message: "Oops! Try again",
        data: [],
      });
    });
});

const getMyReferrals = handleAsync(async (req, res) => {
  const users = await User.find({
    referralCode: req.user.referCode,
  });
  if (users) return res.status(200).json({ message: "Success", data: users });
  else return res.status(400).json({ message: "Invalid Request", data: [] });
});

const sendWelcomeEmail = handleAsync(async (req, res) => {
  transporter.sendMail(
    mailOptions({ email: "sswami610@gmail.com" }),
    function (err, data) {
      if (err) {
        console.log("Error " + err);
        return res.status(404).json({ message: "Not found", data: [] });
      } else {
        return res.status(200).json({ message: "Success", data: [] });
      }
    }
  );
});

const sendPasswordResetEmail = handleAsync(async (req, res) => {
  console.log("req came for pw reset");
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "Invalid email", data: [] });
  const token = await generateToken(email, "600000");
  transporter.sendMail(
    mailOptions({ subject: "Password Reset", email, token, reset: true }),
    function (err, data) {
      if (err) {
        console.log("Error " + err);
        return res.status(404).json({ message: "Not found", data: [] });
      } else {
        return res.status(200).json({ message: "Success", data: [] });
      }
    }
  );
});

const resetPassword = handleAsync(async (req, res) => {
  const { newPassword, token } = req.body;
  const decodedData = jwt.verify(token, process.env.JWTSECRET);
  console.log(decodedData);
  const user = await User.findOne({ email: decodedData.email });
  if (user) {
    user.password = await bcrypt.hash(newPassword, 10);
    const updatedUser = await user.save();
    if (updatedUser)
      return res.status(200).json({ message: "Success", data: [] });
  } else {
    return res.status(400).json({ message: "Invalid request", data: [] });
  }
});

const getMyProfile = handleAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "name email phoneNo walletAddress"
  );
  if (user) return res.status(200).json({ message: "Success", data: user });
  else return res.status(400).json({ message: "Invalid Request", data: [] });
});

module.exports = {
  enableUser,
  getAllUsers,
  disableUser,
  updateUser,
  registerUser,
  loginUser,
  verifyBank,
  getMyProfile,
  getVerificationToken,
  sendOTP,
  verifyUPIId,
  verifyPAN,
  registerForP2P,
  getMyReferrals,
  getAllP2PRequests,
  disableForP2P,
  enableForP2P,
  resetPassword,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
