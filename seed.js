const mongoose = require('mongoose');
const Seat = require('./models/Seat'); // Or wherever your Seat model is
require('dotenv').config();

const seedDB = async () => {
  await mongoose.connect('mongodb+srv://lakshya:yourpassword@cluster0.mongodb.net/volt_db?retryWrites=true&w=majority');
  
  // This creates 50 power nodes for your grid
  const seats = [];
  for (let i = 1; i <= 50; i++) {
    seats.push({ number: i, status: 'idle' });
  }

  await Seat.deleteMany({}); // Clears old data
  await Seat.insertMany(seats);
  console.log("⚡ 50 Power Nodes Installed Successfully!");
  process.exit();
};

seedDB();