const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis server is not running');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return new Error('Max retry attempts reached');
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Disconnected from Redis');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  // Hash operations
  async hmset(key, ...args) {
    return await this.client.hMSet(key, args);
  }

  async hmget(key, ...fields) {
    return await this.client.hmGet(key, fields);
  }

  async hincrby(key, field, increment) {
    return await this.client.hIncrBy(key, field, increment);
  }

  // String operations
  async set(key, value, options = {}) {
    return await this.client.set(key, value, options);
  }

  async get(key) {
    return await this.client.get(key);
  }

  async incr(key) {
    return await this.client.incr(key);
  }

  // Sorted set operations (for sliding window)
  async zadd(key, score, member) {
    return await this.client.zAdd(key, { score, value: member });
  }

  async zcard(key) {
    return await this.client.zCard(key);
  }

  async zremrangebyscore(key, min, max) {
    return await this.client.zRemRangeByScore(key, min, max);
  }

  // Key operations
  async expire(key, seconds) {
    return await this.client.expire(key, seconds);
  }

  async ttl(key) {
    return await this.client.ttl(key);
  }

  async del(key) {
    return await this.client.del(key);
  }

  async keys(pattern) {
    return await this.client.keys(pattern);
  }

  // Pipeline for batch operations
  pipeline() {
    return this.client.multi();
  }

  // Health check
  async ping() {
    return await this.client.ping();
  }

  // Graceful shutdown
  async gracefulShutdown() {
    console.log('Shutting down Redis connection...');
    await this.disconnect();
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Handle process termination
process.on('SIGTERM', async () => {
  await redisClient.gracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await redisClient.gracefulShutdown();
  process.exit(0);
});

module.exports = redisClient;