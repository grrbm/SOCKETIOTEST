//@ts-nocheck

const server = require("server");
const corsPackage = require("cors");
const { get, post, socket, error } = server.router;
const { render, status: serverStatus, header } = server.reply;

const corsWhitelist = [
  "http://localhost:3000",
  "https://www.coworksurf.com",
  "https://coworksurf.com",
  "https://test.coworksurf.com",
  "https://coworksurf-git-feature-adding-socketio-coworksurf.vercel.app/",
];

const generalCorsOptions = {
  origin: function (origin, callback) {
    console.log("Checking origin", { origin });
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // check if the origin ends with '.vercel.app'
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    } else if (corsWhitelist.includes(origin)) {
      console.log("it is in the whitelist. returning true.");
      return callback(null, true);
    } else {
      console.log("hit not allowed");
      callback(new Error("Not allowed by CORS"));
    }
  },
  // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // preflightContinue: false,
  //Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.
  optionsSuccessStatus: 200,
  credentials: true, // Ensure this is set to true
  setHeaders: function (res, path, stat) {
    res.set("Access-Control-Allow-Credentials", "true");
    // Add more headers here as needed
  },
};

const setCookieCorsOptions = {
  ...generalCorsOptions,
  credentials: true, // Ensure this is set to true
  setHeaders: function (res, path, stat) {
    res.set("Access-Control-Allow-Credentials", "true");
    // Add more headers here as needed
  },
};

const corsMiddleware = (req, res, next) => {
  if (req.path === "/set-cookie") {
    corsPackage(setCookieCorsOptions)(req, res, next);
  } else {
    corsPackage(generalCorsOptions)(req, res, next);
  }
};

// Make the express middleware compatible with server
//@ts-ignore
const cors = server.utils.modern(corsMiddleware);

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
    security: false,
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

    post("/set-cookie", (ctx) => {
      console.log("set cookie called");
      const { username } = ctx.body;
      console.log({ username });

      return header("Access-Control-Allow-Credentials", "true")
        .cookie("username", username, {
          maxAge: 900000,
          httpOnly: true,
          // secure: true
        })
        .send();
    }),

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
    error((ctx) => serverStatus(500).send(ctx.error.message)),
  ]
);

console.log(`Running on port `, port);
