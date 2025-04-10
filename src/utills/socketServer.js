const socketIO = require("socket.io");
const Chat = require('../model/Chat');

const createSocketServer = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const users = {}; // Object to store user connections

  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("joinChat", (data) => {
      const { userName, ChatUser, LoginUser } = data;
      if (!userName || !ChatUser || !LoginUser) {
        console.error("❌ Missing parameters in joinChat event:", data);
        return;
      }

      if (ChatUser === LoginUser) {
        console.error("❌ A user cannot chat with themselves.");
        return;
      }

      const roomId = [ChatUser, LoginUser].sort().join("_");
      console.log(`✅ ${userName} joined room ${roomId}`);

      socket.join(roomId);
    });

    // Handle User Online Status
    socket.on("userOnline", (userId) => {
      if (!userId) return;

      if (!users[userId]) {
        users[userId] = new Set(); // Store multiple socket connections per user
      }
      users[userId].add(socket.id);
      console.log(`🟢 User ${userId} is online`);

      io.emit("updateUserStatus", { userId, status: "online" });
    });

    // Handle Send Message
    socket.on("sendMessage", async (data) => {
      const { roomId, message, senderId, receiverId } = data;
        
      if (!roomId || !message || !senderId || !receiverId) {
        console.error("❌ Invalid sendMessage event data:", data);
        return;
      }
    
      try {
        const participants = [senderId, receiverId].sort();
        let chat = await Chat.findOne({ participants });
    
        if (!chat) {
          chat = new Chat({
            participants,
            messages: [{ senderId, text: message }], // Fixed "messages" array name
          });
        } else {
          chat.message.push({ senderId, text: message });
        }
    
        await chat.save();
        socket.to(roomId).emit("receiveMessage", { message, senderId });
    
      } catch (error) {
        console.error("❌ Error saving message:", error);
      }
    });
    socket.on("disconnect", () => {
      let disconnectedUserId = null;

      for (const [userId, sockets] of Object.entries(users)) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);

          if (sockets.size === 0) {
            disconnectedUserId = userId;
            delete users[userId];
          }
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`🔴 User ${disconnectedUserId} is offline`);
        io.emit("updateUserStatus", { userId: disconnectedUserId, status: "offline" });
      }
    });
  });

  return io;
};

module.exports = createSocketServer;
