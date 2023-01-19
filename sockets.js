const User = require("./models/user");
const Message = require("./models/message");

exports.userConnection = (io, socket, users) => {
  /**
   * Handle Previous Message
   * Joining User Room
   */
  const handler = async (obj) => {
    users[socket.id] = obj;

    try {
      const userExist = await User.findOne({ where: { email: obj.email } });
      if (userExist) {
        // Send to all user in root except current requested user.
        socket.broadcast.emit("user-joined", obj.name);
      } else {
        try {
          const create = await User.create({
            username: obj.name,
            email: obj.email,
          });
          socket.broadcast.emit("user-joined", obj.name);
        } catch (err) {
          io.to(socket.id).emit("error", "Cannot create user system error");
        }
      }

      try {
        const oldMessage = await Message.findAll({ include: [User] });

        // Sending old messages to requested user.
        io.to(socket.id).emit("oldMessages", oldMessage);
      } catch (err) {
        io.to(socket.id).emit("error", "Database Error or User not found.");
      }
    } catch (err) {
      io.to(socket.id).emit("error", "Database Error or User not found.");
    }
  };

  socket.on("new-user-join", handler);
};

exports.receivedMessage = (io, socket, users) => {
  /**
   * Handler Received message and store into database
   */
  const handler = async (message) => {
    try {
      const fatchingUser = await User.findOne({
        where: { email: users[socket.id].email },
      });

      const messageStore = await Message.create({
        message: message,
        userId: fatchingUser.dataValues.id,
      });

      socket.broadcast.emit("receive", {
        message: message,
        name: fatchingUser.dataValues.username,
      });
    } catch (err) {
      io.to(socket.id).emit("error", "Database Error or User not found.");
    }
  };
  socket.on("send", handler);
};

exports.userDisconnect = (io, socket, users) => {
  /**
   * Disconnect User
   */
  socket.on("disconnect", (user) => {
    socket.broadcast.emit("left", { data: users[socket.id] });
    delete users[socket.id];
  });
};
