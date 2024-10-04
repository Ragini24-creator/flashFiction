const express = require("express");
const User = require("./models/userModel");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const WebSocket = require("ws");
const http = require("http");
const dotenv = require("dotenv");

const {
  passwordHashing,
  comparePassword,
  generateToken,
} = require("./utils/hashing+jwt");

// const { type } = require("os");

const app = express();

app.use(bodyParser.json());

const server = http.createServer(app);
// Create WebSocket server and bind it to the same HTTP server
const wss = new WebSocket.Server({ server, path: "/ws" });
port = 8000;
server.listen(port, () => {
  console.log("Server listening!");
});

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

const storyContent = [];
const storyArray = [];
const clientsConnected = [];

wss.on("connection", (ws) => {
  clientsConnected.push(ws);
  console.log("A new connection is established from client side");
  ws.send(JSON.stringify({ message: "The server is responding back!" }));

  ws.on("message", (message) => {
    const stringMessage = message.toString();
    console.log("Client sent a new message: ", stringMessage);
    storyArray.push(stringMessage);
    clientsConnected.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(storyArray));
      }
    });
  });

  ws.on("close", (ws) => {
    console.log("connection closed");
    const index = clientsConnected.indexOf(ws);
    if (index > -1) {
      clientsConnected.splice(index, 1);
    }
  });
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
