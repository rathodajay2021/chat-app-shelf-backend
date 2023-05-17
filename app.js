const express = require("express");
const http = require("http");
const cors = require("cors");
const chalk = require("chalk");
const actuator = require("express-actuator");
const socketIo = require("socket.io");

/***************GLOBAL MIDDLEWARE***************/
const PORT = process.env.PORT || 5050;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());
app.use(actuator({ infoGitMode: "full" }));
const { addUser, getUser, removeUser } = require("./Socket.controller");

/***************START SERVER***************/
server.listen(PORT, () => {
  console.log(
    `server running on \n${chalk.underline.blue(`http://localhost:${PORT}`)}`
  );
});

/***************SOCKET IO CONNECTION***************/
io.on("connection", (socket) => {
  //start socket.io connection
  console.log(socket.handshake.auth.offset);

  //on use join start this
  socket.on("join-room", ({ userName, chatRoomName }, callback) => {
    const { error, user } = addUser({ id: socket.id, userName, chatRoomName });

    if (error) return callback(error);
    //create a room in socket.io
    socket.join(chatRoomName.trim().toLowerCase());
    //send welcome message for joining the room
    socket.emit("chatMessage", {
      user: "Admin",
      text: `Welcome ${userName} to ${chatRoomName} room`,
    });
    //broadcast all other user that new user joined
    socket.broadcast.emit("chatMessage", {
      user: "Admin",
      text: `${userName} has joined`,
    });
  });

  socket.on("user-msg", (message, callback) => {
    const users = getUser(socket.id);

    //send everyone user msg
    io.to(users?.room).emit("chatMessage", {
      user: users?.name,
      text: message,
    });
    // socket.broadcast.emit("chatMessage", {
    //   user: users?.name,
    //   text: message,
    // });

    // socket.emit("chatMessage", {
    //   user: "you",
    //   text: message,
    // });
  });

  socket.on("disconnect", () => {
    //on disconnect remove the user from dataTable
    const removedUser = removeUser(socket.id);
    // console.log("🚀 ~ file: app.js:35 ~ socket.on ~ removedUser:", removedUser);
    if (removedUser) {
      //send everyone msg that user is left the chat
      io.to(removedUser.room).emit("chatMessage", {
        user: "Admin",
        text: `${removedUser.name} has left the chat.`,
      });
    }
  });
});

/***************ROUTES***************/
app.use("/", (req, res) => {
  res.send("Server is running just fine");
});
