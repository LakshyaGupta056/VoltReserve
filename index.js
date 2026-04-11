require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Load Routes and Models first
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

// 4. --- EMERGENCY BYPASS ROUTE ---
app.get('/api/seats/:trainId', async (req, res) => {
    try {
        console.log("Bypass active: Fetching nodes directly from DB...");
        const seats = await Seat.find({}); 
        res.status(200).json({ data: seats }); 
    } catch (err) {
        res.status(500).json({ error: "Bypass failed", details: err.message });
    }
});
// ---------------------------------

// 5. Standard Routes
app.use('/api', availabilityRoutes);
app.use('/api', bookingRoutes);

// 6. Start Server & Seed
const PORT = process.env.PORT || 5000;

const autoSeed = async () => {
  try {
      const count = await Seat.countDocuments();
      if (count === 0) {
        const seats = Array.from({ length: 50 }, (_, i) => ({ number: i + 1, status: 'idle' }));
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