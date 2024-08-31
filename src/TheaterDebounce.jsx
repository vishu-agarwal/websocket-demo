import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import debounce from "lodash/debounce";

const socket = io("http://localhost:3100");

function TheaterDebounce() {
  const [seatLayout, setSeatLayout] = useState([]);

  // Fetch intial seat layout from the server
  const fetchSeatLayout = async () => {
    try {
      const response = await axios.get("http://localhost:3100/seats");
      setSeatLayout(response.data.divisions);
    } catch (error) {
      console.error("Error fetching seat layout:", error);
    }
    };
    
    // Handle seat updates from the server
    const handleSeatUpdate = (updatedSeat) => {
      setSeatLayout((prevLayout) => {
        const newLayout = prevLayout.map((division) => {
          if (division.name === updatedSeat.division) {
            return {
              ...division,
              rows: division.rows.map((row) => {
                return {
                  ...row,
                  seats: row.seats.map((seat) => {
                    if (seat.seatNumber === updatedSeat.seatNumber) {
                      return updatedSeat;
                    }
                    return seat;
                  }),
                };
              }),
            };
          }
          return division;
        });
        return newLayout;
      });
    };

  useEffect(() => {

    fetchSeatLayout();

    socket.on("seat-update", handleSeatUpdate);

    return () => {
      socket.off("seat-update", handleSeatUpdate);
      };
      
  }, []);

  // seat selection/deselection
  const handleSeatClick = debounce((seat) => {
    if (seat.status === "available" || seat.status === "selected") {
      const updatedSeat = {
        ...seat,
        status: seat.status === "available" ? "selected" : "available",
        isMarked: !seat.isMarked,
      };
      socket.emit("select-seat", updatedSeat);
    }
  }, 300);

  // Helper function to seat style
  const getSeatStyle = (seat) => {
    if (seat.status === "selected") {
      return { backgroundColor: "green", color: "white" };
    } else if (seat.status === "available") {
      return { backgroundColor: "yellow", color: "black" };
    } else {
      return { backgroundColor: "gray", color: "white" };
    }
  };

  return (
    <div>
      <h3>Theater Seat Layout</h3>
      <div className="theater-layout">
        {seatLayout.map((division) => (
          <div key={division.name} className="division">
            <h4>Division {division.name}</h4>
            {division.rows.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.seats.map((seat) => (
                  <button
                    key={seat.seatNumber}
                    style={getSeatStyle(seat)}
                    className={`seat ${seat.status}`}
                    onClick={() => handleSeatClick(seat)}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TheaterDebounce;