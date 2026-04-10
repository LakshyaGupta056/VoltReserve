# ⚡ VoltReserve: Smart-Grid Power Allocation System

## 📖 Overview
VoltReserve is a high-concurrency energy distribution dashboard designed to simulate a Smart Grid environment. It solves the critical engineering problem of "Race Conditions" in power node allocation using a Two-Phase Commit architecture. 

## 🛠️ Technical Stack
- **Frontend:** React.js (State-driven UI with real-time countdown timers)
- **Backend:** Node.js & Express (RESTful API)
- **Primary Database:** MongoDB Atlas (Persistent state storage)
- **Concurrency Layer:** Redis (Distributed locking & TTL management)

## 🏗️ System Architecture & Logic
1. **Selection Phase (The Relay):** User selects an idle node. Node.js creates an atomic lock in **Redis** with a 300-second TTL (Time-To-Live).
2. **Reservation Phase (The Timer):** React initiates a client-side countdown synchronized with the Redis server expiry.
3. **Commit Phase (The Breaker):** Upon user confirmation, the system validates the lock and performs a final, durable write to **MongoDB**.

## 🚀 Key Engineering Features
- **Atomic Locking (`NX` flag):** Prevents double-allocation of power nodes during high demand, acting as a software-level circuit breaker.
- **Real-Time Analytics:** Live "Grid Utilization" calculation based on active nodes.
- **Auto-Release Logic:** Integrated Redis-expiry to automatically release reserved nodes back to the grid if not confirmed within the 5-minute window.
