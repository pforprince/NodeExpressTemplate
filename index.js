const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const session = require("express-session");
const cors = require("cors");
db();

app.use(
  session({
    secret: "SeSsIoNSeCrEt@99$2",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 * 12 },
  })
);
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Home");
});

app.use("/user", require("./routes/userRoutes"));
app.use("/exchange", require("./routes/exchangeRequestsRoutes"));
app.use("/chat", require("./routes/chatRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("APP is running"));
