const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/userModel");
// const { type } = require("os");
const bodyParser = require("body-parser");
const webSocket = require("ws");

const {
  passwordHashing,
  comparePassword,
  generateToken,
} = require("./utils/hashing+jwt");
const app = express();

app.use(bodyParser.json());

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log(con.connections);
    console.log("DB connection successful!");
  });

port = 8000;
app.listen(port, () => {
  console.log("Server listening!");
});

app.post("/api/v1/user/register", async (req, res) => {
  console.log(req.body);
  const { Name, email, password, profilePicture } = req.body;
  const hashedPassword = await passwordHashing(String(password));
  try {
    const newUser = await User.create({
      Name,
      email,
      password: hashedPassword,
      profilePicture,
    });
    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/api/v1/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }
    const userMatch = await comparePassword(String(password), user.password);
    if (!userMatch) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    } else {
      const token = generateToken(user.Name, email);
      res.status(201).json({
        success: true,
        token: token,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
