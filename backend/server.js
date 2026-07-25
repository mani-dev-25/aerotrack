// backend/server.js
// Why it exists:
// This is the main server launcher. It spins up Express, binds middlewares, routes request paths,
// handles exceptions, and initializes the automated background sensor simulator.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const readingRoutes = require('./routes/readingRoutes');
const readingController = require('./controllers/readingController');

// Load environmental parameters (DB username, DB password, Port, etc.)
dotenv.config();

const app = express();

// Middleware: Enable CORS so the React app running on another port can make requests
app.use(cors());

// Middleware: Parse JSON bodies automatically (enables req.body inside controller)
app.use(express.json());

// Why it exists: Root endpoint to quickly verify server is reachable
// Route: GET /
app.get('/', (req, res) => {
  res.json({ message: 'Air Quality Monitoring Dashboard MVC Backend is running.' });
});

// Why it exists: 
// The problem statement specifies creating "GET /simulate" directly at the root.
// We map it here to invoke the simulator controller method.
// Route: GET /simulate
app.get('/simulate', readingController.simulateReadings);

// Why it exists: Mount the REST API routes under the "/api/readings" prefix
app.use('/api/readings', readingRoutes);

// Why it exists: Global error handling middleware to catch database or logic errors gracefully
app.use((err, req, res, next) => {
  console.error('[Server Crash Guard] Unhandled Error:', err);
  res.status(500).json({ error: 'A critical system error occurred on the server.' });
});

// Port configuration (reads PORT from .env or defaults to 5000)
const PORT = process.env.PORT || 5000;

// Start Express server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  AIR QUALITY MONITORING SYSTEM API IS LIVE                      `);
  console.log(`  Server URL: http://localhost:${PORT}                           `);
  console.log(`  Simulator Endpoint: http://localhost:${PORT}/simulate          `);
  console.log(`================================================================`);
  
  // Start the background data simulator automatically on launch so the user doesn't
  // have to manually hit the URL for the application to function.
  readingController.startSimulatorAutomatically();
});
