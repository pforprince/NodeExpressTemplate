const jwt = require("jsonwebtoken");
const generateToken = async (email, time = "1hr") => {
  try {
    const token = jwt.sign({ email }, process.env.JWTSECRET, {
      expiresIn: time,
    });
    console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
};

const decodeToken = async (req, token) => {
  try {
    if (token) {
      const decodedData = jwt.verify(token, process.env.JWTSECRET);
      console.log(decodedData);
      const ticket = await Ticket.findOne({ _id: decodedData.code });
      if (ticket) {
        return {
          ticket,
          email: decodedData.email,
        };
      }
    }
    return null;
  } catch (error) {
    console.log(error.name);
    console.log(error);
  }
};

module.exports = { generateToken };
