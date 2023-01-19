const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const sequelize = require("./util/database");

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

// Websocket Server Initialization
const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POSt"],
  },
});

// Current Connected Users
const users = {};

// Socket IO Code for Connection and Message Sending System
io.on("connection", async (socket) => {
  // For New User in Room(Live User)
  socket.on("new-user-join", async (obj) => {
    users[socket.id] = obj;

    try {
      const userExist = await User.findOne({ where: { email: obj.email } });
      if (userExist) {
        // Send to all user in root except current requested user.
        socket.broadcast.emit("user-joined", obj.name);

        try {
          const oldMessage = await Message.findAll({ include: [User] });

          // Sending old messages to requested user.
          io.to(socket.id).emit("oldMessages", oldMessage);
        } catch (err) {
          io.to(socket.id).emit("error", "Database Error or User not found.");
        }
      } else {
        try {
          const create = await User.create({
            username: obj.name,
            email: obj.email,
          });
          socket.broadcast.emit("user-joined", obj.name);
          try {
            const oldMessage = await Message.findAll({ include: [User] });

            io.to(socket.id).emit("oldMessages", oldMessage);
          } catch (err) {
            io.to(socket.id).emit("error", "Database Error or User not found.");
          }
        } catch (err) {
          io.to(socket.id).emit("error", "Cannot create user system error");
        }
      }
    } catch (err) {
      io.to(socket.id).emit("error", "Database Error or User not found.");
    }
  });

  socket.on("send", async (message) => {
    try {
      const fatchingUser = await User.findOne({
        where: { email: users[socket.id].email },
      });

      const messageStore = await Message.create({
        message: message,
        userId: fatchingUser.dataValues.id,
      });

      if (messageStore) {
        socket.broadcast.emit("receive", {
          message: message,
          name: fatchingUser.dataValues.username,
        });
      }
    } catch (err) {
      io.to(socket.id).emit("error", "Database Error or User not found.");
    }
  });

  socket.on("disconnect", (user) => {
    socket.broadcast.emit("left", { data: users[socket.id] });
    delete users[socket.id];
  });
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
