require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Load Routes and Models
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/booking');
const Seat = require('./models/Seat'); 

const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// 4. --- THE FIXED EMERGENCY BYPASS ---
app.get('/api/seats/:trainId', async (req, res) => {
    try {
        const now = new Date();

        // FIX: Automatically unlock seats if the "lockedUntil" time has passed
        await Seat.updateMany(
            { 
                status: "LOCKED", 
                lockedUntil: { $lt: now } // If lockedUntil is in the past
            }, 
            { 
                $set: { 
                    status: "AVAILABLE", 
                    lockedByUserId: null, 
                    lockedUntil: null 
                } 
            }
        );

        // Fetch the cleaned-up data
        const seats = await Seat.find({}); 
        res.status(200).json({ data: seats }); 
    } catch (err) {
        console.error("Bypass Error:", err);
        res.status(500).json({ error: "Bypass failed", details: err.message });
    }
});

// 5. Standard Routes
app.use('/api', availabilityRoutes);
app.use('/api', bookingRoutes);

// 6. Start Server & Seed
const PORT = process.env.PORT || 5000;

const autoSeed = async () => {
  try {
      const count = await Seat.countDocuments();
      if (count === 0) {
        const seats = Array.from({ length: 50 }, (_, i) => ({ 
            trainId: "EXPRESS-101", // Match your frontend request
            seatNumber: `S${i + 1}`, 
            status: 'AVAILABLE' 
        }));
        await Seat.insertMany(seats);
        console.log("⚡ Cloud Seeding Complete!");
      }
  } catch (err) {
      console.log("Seed check skipped:", err.message);
  }
};
autoSeed();

app.listen(PORT, () => {
    console.log(`High-Concurrency Ticket Engine running on port ${PORT}`);
});