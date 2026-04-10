require('dotenv').config();
const mongoose = require('mongoose');
const Seat = require('./models/Seat');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to DB for seeding...'))
    .catch(err => console.log(err));

const seedSeats = async () => {
    try {
        await Seat.deleteMany({}); // Clear existing data
        const seats = [];
        
        for (let i = 1; i <= 50; i++) {
            seats.push({
                trainId: "EXPRESS-101",
                seatNumber: `S${i}`,
                status: 'AVAILABLE'
            });
        }

        await Seat.insertMany(seats);
        console.log("Successfully seeded 50 seats for EXPRESS-101!");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSeats();