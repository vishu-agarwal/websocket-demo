import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3100");

function App() {

  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [userMessages, setUserMessages] = useState([]);

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = () => {
    if (message.length)
    {
      socket.emit("user-messages", message)
      setMessage('')
    }
  }

  const fetchApi = async () => {
    const res = await axios.get("http://localhost:3100");
    setValue(res.data);
  };

  useEffect(() => {
    fetchApi();
    // Listen for incoming messages
    const handleIncomingMessage = (msg) => {
      console.log("received message--", msg);
      setUserMessages((prev) => [...prev, msg]);
    };

    socket.on("received-messages", handleIncomingMessage);
    return () => {
      socket.off("user-messages");
      socket.off("received-messages");
    };
  }, []);

  return (
    <div>
      <h3>{value}</h3>
      <input name="message" value={message} onChange={handleChange} />
      <button onClick={handleSubmit}>Send</button>
      <div>
        <h5>Message</h5>
        <div>
          {userMessages.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
