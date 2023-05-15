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
  console.log("🚀 ~ file: app.js:18 ~ socket.id:", socket.id);

  //on use join start this
  socket.on("join-room", ({ userName, chatRoomName }, callback) => {
    const { error, user } = addUser({ id: socket.id, userName, chatRoomName });
    console.log("🚀 ~ file: app.js:30 ~ socket.on ~ user:", user, error);

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
    const user = console.log("🚀 ~ file: app.js:51 ~ socket.on ~ user:", user);
    socket.broadcast.emit("chatMessage", {
      user: "userName",
      text: message,
    });
  });

  socket.on("disconnect", () => {
    const removedUser = removeUser(socket.id);
    console.log("🚀 ~ file: app.js:35 ~ socket.on ~ removedUser:", removedUser);
  });
});

/***************ROUTES***************/
app.use("/", (req, res) => {
  res.send("Server is running just fine");
});
