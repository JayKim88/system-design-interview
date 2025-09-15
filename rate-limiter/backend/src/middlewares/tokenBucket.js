const redis = require("../utils/redis");

class TokenBucket {
  constructor(capacity, refillRate, refillPeriod = 1000) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.refillPeriod = refillPeriod;
  }

  async isAllowed(key) {
    const bucketKey = `bucket:${key}`;
    const now = Date.now();

    const bucket = await redis.hmget(bucketKey, "tokens", "lastRefill");
    let tokens = parseFloat(bucket[0]) || this.capacity;
    let lastRefill = parseInt(bucket[1]) || now;

    const timePassed = now - lastRefill;
    const tokensToAdd =
      Math.floor(timePassed / this.refillPeriod) * this.refillRate;
    tokens = Math.min(this.capacity, tokens + tokensToAdd);

    if (tokens >= 1) {
      tokens -= 1;
      await redis.hmset(bucketKey, "tokens", tokens, "lastRefill", now);
      await redis.expire(bucketKey, 3600);
      return { allowed: true, remaining: tokens };
    }

    return { allowed: false, remaining: tokens };
  }
}

module.exports = (capacity, refillRate) => {
  const bucket = new TokenBucket(capacity, refillRate);

  return async (req, res, next) => {
    const key = req.ip; // ip???
    const result = await bucket.isAllowed(key);

    res.set({
      "X-RateLimit-Limit": capacity,
      "X-RateLimit-Remaining": Math.floor(result.remaining),
      "X-RateLimit-Reset": Date.now() + 60000, // 60s
    });

    if (result.allowed) {
      next();
    } else {
      res.status(429).json({
        error: "Rate Limit exceeded",
      });
    }
  };
};
