require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/booking');

const app = express();

app.use(cors()); // This must be ABOVE your app.use('/api', ...) lines

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing of JSON bodies

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// Register Routes
app.use('/api', availabilityRoutes);
app.use('/api', bookingRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
const Seat = require('./models/Seat');
const autoSeed = async () => {
  const count = await Seat.countDocuments();
  if (count === 0) {
    const seats = Array.from({ length: 50 }, (_, i) => ({ number: i + 1, status: 'idle' }));
    await Seat.insertMany(seats);
    console.log("⚡ Cloud Seeding Complete!");
  }
};
autoSeed();
app.listen(PORT, () => {
    console.log(`High-Concurrency Ticket Engine running on port ${PORT}`);
});