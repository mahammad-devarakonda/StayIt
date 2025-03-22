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

  io.on("connection", async (socket) => {
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

    socket.on("sendMessage", async (data) => {
      const { roomId, message, senderId, receiverId } = data;

      console.log("Received sendMessage event:", data);

      if (!roomId) console.error("❌ Missing roomId");
      if (!message) console.error("❌ Missing message");
      if (!senderId) console.error("❌ Missing senderId");
      if (!receiverId) console.error("❌ Missing receiverId");

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
            message: [{ senderId, text: message }], // ✅ Correct key names
          });
        } else {
          chat.message.push({ senderId, text: message }); // ✅ Correct key names
        }

        await chat.save();
        socket.to(roomId).emit("receiveMessage", { message, senderId });

      } catch (error) {
        console.error("❌ Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = createSocketServer;
