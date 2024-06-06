import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [room, setRoom] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
    });

    socketRef.current.on("message", (message: any) => {
      setMessages((prevMessages: any) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("join_room", room);
      setCurrentRoom(room);
      setMessages([]); // Clear messages when joining a new room
    }
  };

  const sendMessage = () => {
    if (socketRef.current) {
      socketRef.current.emit("send_message", { room: currentRoom, message });
      setMessage(""); // Clear the message input after sending
    }
  };

  return (
    <div className="flex text-black justify-center py-20 bg-gray-200 w-full h-full min-w-[100vw] min-h-[100vh]">
      <div className="bg-white border border-black flex flex-col w-[500px] h-[500px]">
        <div className="messages p-4 h-full">
          <h2>Current Room: {currentRoom}</h2>
          <div className="text-black">Messages:</div>
          <div className="h-full">
            {messages.map((msg: any, index: number) => (
              <div className="text-black" key={index}>
                {msg}
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full border-t border-black">
          <input
            type="text"
            className="pl-2 w-3/4 bg-gray-200 text-black"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room"
          />
          <button className="bg-green-500 w-1/4" onClick={joinRoom}>
            Join Room
          </button>
        </div>
        <div className="flex w-full border-t border-black">
          <input
            type="text"
            className="pl-2 w-3/4 bg-gray-200 text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
          />
          <button className="bg-green-500 w-1/4" onClick={sendMessage}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
