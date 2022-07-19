const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decodedData = jwt.verify(token, process.env.JWTSECRET);
      const user = await User.findOne({ email: decodedData.email });

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: "Invalid token" });
      }
    } else {
      res.status(401).json({ message: "Please try after login" });
    }
  } catch (error) {
    console.log(error.name);
    console.log(error);
    res.status(401).json({ message: "Please try after login" });
  }
};

module.exports = isAuthenticated;
