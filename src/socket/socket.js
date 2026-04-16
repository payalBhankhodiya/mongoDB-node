import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    console.log("Authenticated user:", socket.user);

    socket.on("joinRoom", ({ recipientId }) => {
      const userId = socket.user.id;

      const roomId = [userId, recipientId].sort().join("-");
      socket.join(roomId);

      socket.emit("roomJoined", { roomId });

      console.log(`roomId:: ${roomId}`);
    });

    socket.on("sendMessage", ({ roomId, message }) => {
      if (!roomId || !message) return;

      const senderId = socket.user.id;

      console.log(`Message from ${senderId} to room ${roomId}:`, message);

      io.to(roomId).emit("receiveMessage", {
        message,
        senderId,
      });
    });

    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("typing", {
        userId: socket.user.id,
      });
    });



    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
