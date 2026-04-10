const express = require('express');
const router = express.Router();
const redis = require('./redisClient'); // Change '../' to './'
const Seat = require('../models/Seat');

// 1. PHASE 1: Create the Temporary Lock (Redis)
router.post('/book', async (req, res) => {
    const { trainId, seatNumber, userId } = req.body;
    const lockKey = `lock:${trainId}:${seatNumber}`;

    try {
        // Try to set the lock in Redis (NX = Only if it doesn't exist, EX 300 = Expire in 5 mins)
        const locked = await redis.set(lockKey, userId, 'NX', 'EX', 300);

        if (!locked) {
            return res.status(400).json({ error: "Node is currently being reserved by another user." });
        }

        // Update MongoDB status to show it's "Pending"
        await Seat.findOneAndUpdate(
            { trainId, seatNumber },
            { status: 'LOCKED' }
        );

        res.json({ message: `Node ${seatNumber} locked for 5 minutes.` });
    } catch (err) {
        console.error("Locking Error:", err);
        res.status(500).json({ error: "Internal Grid Error" });
    }
});

// 2. PHASE 2: Finalize the Allocation (MongoDB)
router.post('/confirm', async (req, res) => {
    const { trainId, seatNumber } = req.body;
    const lockKey = `lock:${trainId}:${seatNumber}`;

    try {
        // Check if the Redis lock is still alive
        const lockValue = await redis.get(lockKey);

        if (!lockValue) {
            return res.status(400).json({ error: "Reservation timeout! Node released." });
        }

        // Move to permanent 'BOOKED' status
        await Seat.findOneAndUpdate(
            { trainId, seatNumber },
            { status: 'BOOKED' }
        );

        // Remove the temporary lock
        await redis.del(lockKey);

        res.json({ message: `Node ${seatNumber} successfully allocated to Grid.` });
    } catch (err) {
        console.error("Confirmation Error:", err);
        res.status(500).json({ error: "Database Synchronization Error" });
    }
});

// CRITICAL: This is the 'Main Connection' to index.js
module.exports = router;