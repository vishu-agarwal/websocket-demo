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
    origin: "http://localhost:3000", // Allow the React frontend to connect
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Load seat layout from JSON file
let seatLayout;
const loadSeatLayout = () => {
  const dataPath = path.join(__dirname, "./layout-example.json");
  const data = fs.readFileSync(dataPath, "utf-8");
  seatLayout = JSON.parse(data);
};

// Save seat layout to JSON file
const saveSeatLayout = () => {
  const dataPath = path.join(__dirname, "seats.json");
  fs.writeFileSync(dataPath, JSON.stringify(seatLayout, null, 2), "utf-8");
};

// Initial load
loadSeatLayout();

// Endpoint to get the seat layout
app.get("/seats", (req, res) => {
  res.json(seatLayout);
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for seat selection/deselection events
  socket.on("select-seat", (seat) => {
    console.log("Seat updated:", seat);

    // Update seat in server-side data
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

    // Save the updated layout to file
    saveSeatLayout();

    // Broadcast the updated seat to all connected clients
    io.emit("seat-update", seat);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(3100, () => {
  console.log("Server is running on http://localhost:3100");
});
