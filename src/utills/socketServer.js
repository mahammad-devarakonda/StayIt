const socketIO = require("socket.io");
const Chat = require("../model/Chat");

const createSocketServer = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const users = {};

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userName, ChatUser, LoginUser }) => {
      if (!userName || !ChatUser || !LoginUser || ChatUser === LoginUser) {
        return console.error("❌ Invalid joinChat event data");
      }

      const roomId = [ChatUser, LoginUser].sort().join("_");
      socket.join(roomId);
      socket.roomId = roomId; 
    });

    socket.on("userOnline", (userId) => {
      if (!userId) return;

      users[userId] = users[userId] || new Set();
      users[userId].add(socket.id);

      io.emit("updateUserStatus", { userId, status: "online" });
    });

    socket.on("sendMessage", async ({ roomId, message, senderId, receiverId }) => {
      if (!roomId || !message || !senderId || !receiverId) {
        return console.error("❌ Invalid sendMessage payload");
      }

      try {
        const participants = [senderId, receiverId].sort();
        let chat = await Chat.findOne({ participants });

        const newMsg = { senderId, text: message };

        if (!chat) {
          chat = new Chat({ participants, messages: [newMsg] });
        } else {
          chat.message.push(newMsg);
        }

        await chat.save();

        io.to(roomId).emit("receiveMessage", {
          ...newMsg,
          roomId,
          timestamp: new Date(),
        });

      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUser = null;

      for (const [userId, sockets] of Object.entries(users)) {
        if (sockets.delete(socket.id)) {
          if (sockets.size === 0) {
            disconnectedUser = userId;
            delete users[userId];
          }
          break;
        }
      }

      if (disconnectedUser) {
        io.emit("updateUserStatus", { userId: disconnectedUser, status: "offline" });
      }
    });
  });

  return io;
};

module.exports = createSocketServer;
