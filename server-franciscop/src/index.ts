//@ts-nocheck

const server = require("server");
const { get, socket } = server.router;
const { render } = server.reply;

const cors = [
  (ctx) => header("Access-Control-Allow-Origin", "*"),
  (ctx) =>
    header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    ),
  (ctx) =>
    header(
      "Access-Control-Allow-Methods",
      "GET, PUT, PATCH, POST, DELETE, HEAD, SOCKET"
    ),
  (ctx) => (ctx.method.toLowerCase() === "options" ? 200 : false),
];

const port = 4000;
// Update everyone with the current user count
const updateCounter = (ctx) => {
  ctx.io.emit("count", Object.keys(ctx.io.sockets.sockets).length);
};

// Send the new message to everyone
const sendMessage = (ctx) => {
  const { room, message } = ctx.data;
  ctx.io.to(room).emit("message", message);
  console.log(`Message sent to room ${room}: ${message}`);
};

server(
  {
    port,
    socket: {
      /**
       * NOTE:
       *
       * This will only work if my pull request to Franciscop server gets accepted.
       *
       */
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
      },
    },
  },
  cors,
  [
    get("/", (ctx) => render("index.html")),
    socket("connection", updateCounter),
    socket("disconnect", updateCounter),
    socket("send_message", sendMessage),
    socket("join_room", ({ path, data, socket }) => {
      const roomName = data;
      socket.join(roomName, () => {
        console.log("successfully joined room");
      });
      console.log(socket.id + " joined " + roomName);
    }),
  ]
);

console.log(`Running on port `, port);
