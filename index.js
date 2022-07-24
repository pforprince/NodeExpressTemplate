const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const cors = require("cors");
db();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Home");
});

app.use("/user", require("./routes/userRoutes"));
app.use("/exchange", require("./routes/exchangeRequestsRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("APP is running"));
