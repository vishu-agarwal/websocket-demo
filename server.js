const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors")
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors());
app.options("*", cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//socket connection-----

io.on("connection", (socket) => {
  console.log("socket user connected: ", socket.id);

  // Listen for messages from clients
  socket.on("user-messages", (message) => {
      console.log("received user messages: ", message);
       socket.broadcast.emit("received-messages", message);
    //    io.emit("user-messages", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

app.get("/",  (req, res) => {
  return res.send("welcome to chat app");
});

server.listen(3100, () => console.log("server started"));
