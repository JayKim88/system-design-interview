const redis = require("../utils/redis");

class RateLimiterMetrics {
  static async recordRequest(algorithm, clientId, allowed) {
    const key = `metrics:${algorithm}:${Date.now()}`;
    await redis.hincrby(key, "total", 1);
    await redis.hincrby(key, allowed ? "allowed" : "blocked", 1);
    await redis.expire(key, 3600); // 1 hour retention
  }

  static async getMetrics(algorithm, timeRange = 3600) {
    // Aggregate metrics for dashboard
    const pattern = `metrics:${algorithm}:*`;
    const keys = await redis.keys(pattern);

    let totalRequests = 0;
    let blockedRequests = 0;

    for (const key of keys) {
      const metrics = await redis.hmget(key, "total", "blocked");
      totalRequests += parseInt(metrics[0] || 0);
      blockedRequests += parseInt(metrics[1] || 0);
    }

    return {
      totalRequests,
      blockedRequests,
      allowedRequests: totalRequests - blockedRequests,
      blockRate:
        totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0,
    };
  }
}

module.exports = RateLimiterMetrics;
