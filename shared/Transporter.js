const nodemailer = require("nodemailer");
const { EmailTemplate } = require("./EmailTemplate");
const { resetEmailPasswordTemplate } = require("./passwordReset");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const mailOptions = ({
  email,
  subject = "Welcome to Cotlox",
  reset = false,
  token,
}) => {
  return {
    from: "swapnil.digitalonebox@gmail.com",
    to: email,
    subject,
    text: reset ? resetEmailPasswordTemplate(token) : EmailTemplate,
    html: reset ? resetEmailPasswordTemplate(token) : EmailTemplate,
  };
};

module.exports = { transporter, mailOptions };
