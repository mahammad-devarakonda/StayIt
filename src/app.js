const express = require("express");
const connectDB = require("./utills/config");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const createGraphQLServer = require("./utills/graphqlServer");
const createSocketServer = require("./utills/socketServer");
const mongoose = require("mongoose");
const User = require("./model/User");
require("dotenv").config();


const watchPosts = async () => {
  const postCollection = mongoose.connection.collection("posts");
  const changeStream = postCollection.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "delete") {
      const postId = change.documentKey._id;
      console.log(`🗑️ Post deleted: ${postId}`);
      await User.updateMany({}, { $pull: { posts: postId } });
      console.log(`✅ Post ${postId} removed from users' posts array`);
    }
  });

  changeStream.on("error", (error) => {
    console.error("🚨 Change Stream Error:", error);
    changeStream.close();
    setTimeout(watchPosts, 5000);
  });

  console.log("👀 Watching for post deletions...");
};

const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(
    cors({
      origin: process.env.FRONTEND,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());
  /*  app.use((req, res, next) => {
    console.log(`📩 Received ${req.method} request to ${req.url}`);
    console.log("🔗 Headers:", req.headers);
    console.log("📦 Body:", req.body);
    console.log("🧵 Query Params:", req.query);
    console.log("🆔 Params:", req.params);
    next();
  }) */
  

  try {
    await connectDB();
    console.log("✅ MongoDB Connection Established...");

    const server = http.createServer(app);
    const io = createSocketServer(server);

    watchPosts();
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

startServer();
