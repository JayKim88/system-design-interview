const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const redis = require("./utils/redis");

// Import middlewares
const tokenBucket = require("./middlewares/tokenBucket");
const slidingWindow = require("./middlewares/slidingWindow");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await redis.ping();
    res.json({ status: "OK", redis: "connected", timestamp: Date.now() });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      redis: "disconnected",
      error: error.message,
    });
  }
});

// Rate limited endpoints
app.get(
  "/api/token-bucket",
  tokenBucket(10, 2), // 10 tokens capacity, refill 2 per second
  (req, res) => {
    res.json({
      message: "Token bucket success",
      timestamp: Date.now(),
      algorithm: "token-bucket",
    });
  }
);

app.get(
  "/api/sliding-window",
  slidingWindow(60000, 50), // 50 requests per minute window
  (req, res) => {
    res.json({
      message: "Sliding window success",
      timestamp: Date.now(),
      algorithm: "sliding-window",
    });
  }
);

// Rate limiter info endpoint
app.get("/api/limiter-info/:type", async (req, res) => {
  const { type } = req.params;

  const configs = {
    "token-bucket": { capacity: 10, refillRate: 2, refillPeriod: 1000 },
    "sliding-window": { windowSize: 60000, maxRequests: 50 },
  };

  res.json({
    type,
    config: configs[type] || {},
    timestamp: Date.now(),
  });
});

// Start server
async function startServer() {
  try {
    // Connect to Redis first
    await redis.connect();

    app.listen(PORT, () => {
      console.log(`🚀 Rate Limiter API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🪣 Token Bucket: http://localhost:${PORT}/api/token-bucket`);
      console.log(`📊 Sliding Window: http://localhost:${PORT}/api/sliding-window`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
