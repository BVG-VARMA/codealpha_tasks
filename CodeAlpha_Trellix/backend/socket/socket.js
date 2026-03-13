const socketIO = require("socket.io");

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    socket.on("joinProject", (projectId) => {
      // Leave all other rooms first
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      rooms.forEach((room) => socket.leave(room));
      socket.join(projectId);
    });

    socket.on("leaveProject", (projectId) => {
      socket.leave(projectId);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

module.exports = initSocket;
