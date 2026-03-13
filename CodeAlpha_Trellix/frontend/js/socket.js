const SOCKET_URL = "http://localhost:5000";
let socket = null;

const initSocket = (projectId, callbacks = {}) => {
  // Destroy existing socket before creating new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  socket = io(SOCKET_URL, {
    query: { userId: user._id },
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 3,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("joinProject", projectId);
    if (callbacks.onConnect) callbacks.onConnect();
  });

  socket.on("taskCreated", (task) => {
    if (callbacks.onTaskCreated) callbacks.onTaskCreated(task);
  });

  socket.on("taskUpdated", (task) => {
    if (callbacks.onTaskUpdated) callbacks.onTaskUpdated(task);
  });

  socket.on("taskDeleted", ({ taskId }) => {
    if (callbacks.onTaskDeleted) callbacks.onTaskDeleted(taskId);
  });

  socket.on("commentAdded", (comment) => {
    if (callbacks.onCommentAdded) callbacks.onCommentAdded(comment);
  });

  socket.on("commentDeleted", ({ commentId }) => {
    if (callbacks.onCommentDeleted) callbacks.onCommentDeleted(commentId);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (callbacks.onDisconnect) callbacks.onDisconnect();
  });

  socket.on("connect_error", (err) => {
    console.log("Socket error:", err.message);
  });

  return socket;
};

const disconnectSocket = (projectId) => {
  if (socket) {
    socket.emit("leaveProject", projectId);
    socket.disconnect();
    socket = null;
  }
};
