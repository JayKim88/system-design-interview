const express = require("express");
const cors = require("cors");
const tokenBucket = require("./middlewares/tokenBucket");
const slidingWindow = require("./middlewares/slidingWindow");

const app = express();

app.use(cors());
app.use(express.json());

app.get(
  "/api/token-bucket",
  tokenBucket(10, 2), // 10 tokens, refill 2 per second
  (req, res) => {
    res.json({ message: "Token bucket success", timestamp: Date.now() });
  }
);

app.get(
  "/api/sliding-window",
  slidingWindow(60000, 50), // 50 requests per minute
  (req, res) => {
    res.json({
      message: "Sliding window success",
      timestamp: Date.now(),
    });
  }
);

app.get("/api/limiter-info/:type", async (req, res) => {
  const { type } = req.params;

  res.json({
    type,
    limits:
      type === "token-bucket"
        ? { capacity: 10, refill: 2 }
        : { window: 60000, max: 50 },
  });
});

module.exports = app;
