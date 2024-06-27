import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.post("/set-cookie", (req, res) => {
  console.log("set cookie called");
  res.cookie("username", "JohnDoe", {
    maxAge: 900000,
    httpOnly: true,
    // secure: true
  });
  res.send("Cookie has been set");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("send_message", ({ room, message }) => {
    io.to(room).emit("message", message);
    console.log(`Message sent to room ${room}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
