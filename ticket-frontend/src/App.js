import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, CheckCircle, Armchair, Timer } from 'lucide-react';
import './App.css';

// Centralized API Base URL
const API_BASE = "https://voltreserve-tixs.onrender.com/api";

function App() {
  const [seats, setSeats] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/seats/EXPRESS-101`);
      setSeats(res.data.data);
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  };

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (selectedSeat) {
        setMessage("Session Expired! Please select the node again.");
        setSelectedSeat(null);
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedSeat]);

  const handleLock = async (seatNumber) => {
    try {
      setMessage(`Locking Node ${seatNumber}...`);
      await axios.post(`${API_BASE}/book`, {
        trainId: 'EXPRESS-101', seatNumber, userId: 'NIT_H_Student'
      });
      setSelectedSeat(seatNumber);
      setTimeLeft(300); 
      fetchSeats();
    } catch (err) { 
      setMessage(err.response?.data?.error || "Lock failed"); 
    }
  };

  const handleConfirm = async () => {
    try {
      // FIXED: Removed localhost, now using live Render URL
      await axios.post(`${API_BASE}/confirm`, {
        trainId: 'EXPRESS-101', seatNumber: selectedSeat
      });
      setMessage("Success: Power Node Allocated!");
      setSelectedSeat(null);
      setTimeLeft(0);
      fetchSeats();
    } catch (err) {
      setMessage("Error: Time expired or connection lost.");
      setSelectedSeat(null);
      setTimeLeft(0);
      fetchSeats();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="App">
      <header className="header">
        <Zap size={48} color="#f1c40f" />
        <h1>VoltReserve Dashboard</h1>
        <p>Smart-Grid Distributed Power Allocation</p>
      </header>

      {message && <div className={`status-banner ${message.includes('Error') || message.includes('failed') ? 'err' : ''}`}>{message}</div>}

      {selectedSeat && (
        <div className="confirm-panel">
          <h3>Node {selectedSeat} Reserved</h3>
          <div className="timer-display">
            <Timer size={18} /> Time Remaining: <strong>{formatTime(timeLeft)}</strong>
          </div>
          <button className="confirm-btn" onClick={handleConfirm}>
            <CheckCircle size={20} /> Confirm Allocation
          </button>
        </div>
      )}

      <div className="train-coach">
        <div className="seat-grid">
          {seats.map((seat) => (
            <div 
              key={seat.seatNumber}
              className={`seat-box ${seat.status.toLowerCase()} ${selectedSeat === seat.seatNumber ? 'active-selection' : ''}`}
              onClick={() => seat.status === 'AVAILABLE' && !selectedSeat && handleLock(seat.seatNumber)}
            >
              <Armchair size={20} />
              <span className="seat-label">{seat.seatNumber}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="legend">
        <div className="legend-item"><span className="dot available"></span> Idle</div>
        <div className="legend-item"><span className="dot locked"></span> Pending</div>
        <div className="legend-item"><span className="dot booked"></span> Allocated</div>
      </div>

      <div className="analytics-footer">
        <div className="stat">
          <span className="label">Grid Utilization:</span>
          <span className="value">
            {seats.length > 0 ? ((seats.filter(s => s.status === 'BOOKED').length / seats.length) * 100).toFixed(1) : "0.0"}%
          </span>
        </div>
        <div className="stat">
          <span className="label">Active Reserves:</span>
          <span className="value">{seats.filter(s => s.status === 'LOCKED').length}</span>
        </div>
      </div>
    </div>
  );
}

export default App;