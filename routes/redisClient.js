const Redis = require('ioredis');

// This is the "Smart Switch". 
// If a cloud REDIS_URL exists (like on Render), it uses that.
// If it doesn't exist (like on your laptop), it falls back to local.
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379'); 

redis.on('connect', () => console.log('✅ Redis connected successfully'));
redis.on('error', (err) => console.error('❌ Redis Connection Error', err));

module.exports = redis;;