import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Home() {
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    // Add any other event listeners here

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Hello World</div>;
}
