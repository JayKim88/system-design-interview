const redis = require("../utils/redis");

module.exports = (windowSize, maxRequests) => {
  return async (req, res, next) => {
    const key = `sliding:${req.ip}`;
    const now = Date.now();
    const windowStart = now - windowSize;

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pineline.zcard(key);
    pipeline.expire(key, Math.ceil(windowSize / 1000));

    const results = await pipeline.exec();
    const currentRequests = results[1][1];

    if (currentRequests < maxRequests) {
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      res.set({
        "X-RateLimit-Remaining": maxRequests - currentRequests - 1,
      });
      next();
    } else {
      res.status(429).json({
        error: "Rate limit exceeded",
      });
    }
  };
};
