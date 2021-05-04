const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
db();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Home");
});

// app.use("/user", require("./routes/userRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("APP is running"));
