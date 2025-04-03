const redis = require("redis");

// Create Redis client
const client = redis.createClient({
  socket: {
    host: "127.0.0.1", // or "localhost"
    port: 6379,
  },
});

// Handle connection
client.on("connect", () => console.log("✅ Redis Connected!"));
client.on("error", (err) => console.error("❌ Redis Connection Error:", err));

// Connect to Redis (async required)
(async () => {
  try {
    await client.connect();
    console.log("🔗 Redis Client Connected Successfully!");
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error);
  }
})();

module.exports = client;
