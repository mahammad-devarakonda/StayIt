const socketIO = require("socket.io");

const createSocketServer = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("join",()=>{
      console.log(`✅ Client Joined: ${socket.id}`);
    })

    socket.on("sendMessage",()=>{
      console.log(`Message Sent: ${socket.id}`);
    })

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = createSocketServer;
