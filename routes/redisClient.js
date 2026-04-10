const Redis = require('ioredis');

// Create a Redis client instance
const redis = new Redis({
  host: '127.0.0.1', // Localhost
  port: 6379,        // Default Redis/Memurai port
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;