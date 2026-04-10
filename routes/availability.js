const express = require('express');
const redis = require('redis');
const Seat = require('../models/Seat');

const router = express.Router();

// Initialize Redis Client
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
//redisClient.connect().catch(console.error);

router.get('/seats/:trainId', async (req, res) => {
    const { trainId } = req.params;
    const cacheKey = `train:${trainId}:seats`;

    try {
        // 1. Check Redis cache
        const cachedSeats = await redisClient.get(cacheKey);
        if (cachedSeats) {
            return res.status(200).json({ source: 'cache', data: JSON.parse(cachedSeats) });
        }

        // 2. Cache miss -> Query MongoDB
        const seats = await Seat.find({ trainId: trainId });

        // 3. Save to Redis for 60 seconds
        await redisClient.setEx(cacheKey, 60, JSON.stringify(seats));

        return res.status(200).json({ source: 'database', data: seats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;