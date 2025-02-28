const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const connectDB = require("./utills/config");
const mergeResolvers = require("./resolvers/indexResolver");
const mergeTypeDefs = require("./typeDefs/indextypeDef");
const userAuthMiddleware = require("./middleWare/authMiddleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require('../src/model/User')
const mongoose = require('mongoose')
const { graphqlUploadExpress } = require('graphql-upload');
require("dotenv").config();



const watchPosts = async () => {
  const postCollection = mongoose.connection.collection("posts");
  const changeStream = postCollection.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "delete") {
      const postId = change.documentKey._id;
      console.log(`🗑️ Post deleted: ${postId}`);

      // Remove the deleted post ID from all users
      await User.updateMany({}, { $pull: { posts: postId } });

      console.log(`✅ Post ${postId} removed from users' posts array`);
    }
  });

  changeStream.on("error", (error) => {
    console.error("🚨 Change Stream Error:", error);
    changeStream.close(); // Close stream on error to prevent crashes
    setTimeout(watchPosts, 5000); // Restart after 5 sec
  });

  console.log("👀 Watching for post deletions...");
};

const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;
  let graphqlUploadExpress;
  try {
    graphqlUploadExpress = require("graphql-upload").graphqlUploadExpress;
    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  } catch (error) {
    console.warn("⚠️ graphql-upload is not compatible with this setup. Skipping...");
  }

  app.use(
    cors({
      origin: process.env.FRONTEND,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use((req, res, next) => {
    console.log(`📩 Incoming Request: ${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
  });
  

  try {
    await connectDB();
    console.log("✅ MongoDB Connection Established...");
    watchPosts();

    const server = new ApolloServer({
      typeDefs: mergeTypeDefs,
      resolvers: mergeResolvers,
      context: ({ req, res }) => {
        try {
          const user = userAuthMiddleware(req);
          return { res, user };
        } catch (err) {
          console.error("Authentication Error:", err.message);
          return { res, user: null };
        }
      },
      playground: true,
    });

    await server.start();
    server.applyMiddleware({ app });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (err) {
    console.error("❌ Server Startup Error:", err);
    process.exit(1); // Exit process on failure
  }

};

startServer(); 