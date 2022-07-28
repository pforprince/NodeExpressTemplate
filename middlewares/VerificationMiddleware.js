const axios = require("axios");
const { BASEURL } = require("../shared/Utils");

const getVerificationToken = async (req) => {
  var formData = new URLSearchParams();
  formData.append("client_id", process.env.CLIENT_ID);
  formData.append("client_secret", process.env.CLIENT_SECRET);
  const data = await axios.post(`${BASEURL}/authorize`, formData);
  // .then((response) => {
  //   console.log("token", response.data.access_token);
  //   req.session.token = response.data.access_token;
  // })
  // .catch((e) => {
  //   console.log(e);
  // });
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx");
  console.log(data.data.access_token);
  req.session.token = data.data.access_token;
};

const VerificationMiddleware = async (req, res, next) => {
  try {
    if (!req.session.token) {
      await getVerificationToken(req);
      next();
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Please try after login" });
  }
};

module.exports = VerificationMiddleware;
