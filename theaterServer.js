const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let seatLayout;
const loadSeatLayout = () => {
  const dataPath = path.join(__dirname, "./layout-example.json");
  const data = fs.readFileSync(dataPath, "utf-8");
  seatLayout = JSON.parse(data);
};

const saveSeatLayout = () => {
  const dataPath = path.join(__dirname, "seats.json");
  fs.writeFileSync(dataPath, JSON.stringify(seatLayout, null, 2), "utf-8");
};

loadSeatLayout();

app.get("/seats", (req, res) => {
  res.json(seatLayout);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("select-seat", (seat) => {
    console.log("Seat updated:", seat);

    seatLayout.divisions.forEach((division) => {
      division.rows.forEach((row) => {
        row.seats.forEach((s) => {
          if (s.seatNumber === seat.seatNumber) {
            s.status = seat.status;
            s.isMarked = seat.isMarked;
          }
        });
      });
    });

    saveSeatLayout();
    io.emit("seat-update", seat);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3100, () => {
  console.log("Server is running on http://localhost:3100");
});
