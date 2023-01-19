const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const sequelize = require("./util/database");
const { userConnection,receivedMessage,userDisconnect } = require("./sockets");

// Models
const User = require("./models/user");
const Message = require("./models/message");

// Express Server
const http = require("http").createServer(app);

// Middleware
app.use(cors());
app.use(express.static("static"));

// Static Serving Frontend
const router = express.Router();
router.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/client/index.html"));
});
app.use(router);

// Connected Users Object
const users = {};

// Websocket Server Initialization
const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POSt"],
  },
});


// Socket IO handler for all socket function
io.on("connection", async (socket) => {

  // For New User in Room(Live User)
  userConnection(io, socket,users);
  receivedMessage(io, socket,users);
  userDisconnect(io, socket,users);
});

// Database sync and server listen port
sequelize
  .sync()
  .then(() => {
    // Models Relationship
    User.hasMany(Message, {
      onDelete: "CASCADE",
    });
    Message.belongsTo(User);

    http.listen(4000, () => {
      console.log("listening on *:4000");
    });
  })
  .catch((err) => {
    console.log("Error in sequelize.");
  });
