const express = require("express");
const connectDB = require("./utills/config");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet"); // Added Security Middleware
const createGraphQLServer = require("./utills/graphqlServer");
const createSocketServer = require("./utills/socketServer");
require("dotenv").config();

require('../src/utills/CornScheaduler')


const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser()); // Ensure this is before GraphQL
  app.use(helmet()); // Secure HTTP headers

  app.use((req, res, next) => {
/*     console.log("📥 Incoming Request:");
    console.log("➡️ Method:", req.method);
    console.log("➡️ URL:", req.originalUrl);
    console.log("➡️ Headers:", req.headers); */
    console.log("➡️ Body:", req.body);
    next();
  });

  try {
    await connectDB();
    console.log("✅ MongoDB Connection Established...");

    const server = http.createServer(app);
    const io = createSocketServer(server);
    await createGraphQLServer(app, io);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
      console.log(`🔌 WebSocket Server running on ws://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server Startup Error:", err);
    process.exit(1);
  }
};

// Handle unexpected errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
