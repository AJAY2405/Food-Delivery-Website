// utils/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  // Auth every socket connection with the same JWT used for the REST API.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // A rider goes "online" — join the shared room that broadcasts
    // newly-ready orders and claim notifications.
    socket.on("rider:online", () => {
      socket.join("riders");
    });

    // Customer (or rider) opens the live tracking view for one order.
    socket.on("order:join", (orderId) => {
      socket.join(`order_${orderId}`);
    });

    socket.on("order:leave", (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    // Rider's app pings its coordinates every few seconds while on a
    // delivery. We just relay it to whoever is watching that order.
    socket.on("rider:location", ({ orderId, lat, lng }) => {
      if (!orderId || lat == null || lng == null) return;
      io.to(`order_${orderId}`).emit("rider:location", {
        orderId,
        lat,
        lng,
        riderId: socket.userId,
        updatedAt: new Date(),
      });
    });

    socket.on("disconnect", () => {
      // rooms are cleaned up automatically by socket.io
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket() first");
  return io;
};
