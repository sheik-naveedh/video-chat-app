const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const { ExpressPeerServer } = require("peer");
const peerServerOptions = {
  debug: true,
};

// Serve PeerJS server on /peerjs
app.use("/peerjs", ExpressPeerServer(server, peerServerOptions));

// Serve static files from the "public" folder
app.use(express.static("public"));

// Redirect to a unique room ID when the root URL is accessed
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Render the room view with the generated room ID
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Socket.io logic
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);

    // Notify existing users that a new user joined
    setTimeout(() => {
      socket.to(roomId).emit("user-connected", userId);
    }, 1000);

    // Handle chat messages
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

// Start the server
server.listen(process.env.PORT || 3030, () => {
  console.log("Server is running on port 3030");
});
