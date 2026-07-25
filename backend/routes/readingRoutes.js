// backend/routes/readingRoutes.js
// Why it exists:
// This file serves as the Router layer. It maps URL routes to controller action methods
// for the "/api/readings" endpoint group.

const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');

// Why it exists: Retrieve all readings (supports ?locality=Anna+Nagar and ?level=Good)
// Route: GET /api/readings
router.get('/', readingController.getAllReadings);

// Why it exists: Retrieve aggregate stats for counts of Good, Moderate, Unhealthy, Danger
// Route: GET /api/readings/stats
router.get('/stats', readingController.getDashboardStats);

// Why it exists: Retrieve chronological readings for Chart.js trend graph
// Route: GET /api/readings/trend
router.get('/trend', readingController.getTrendData);

// Why it exists: Manually insert a single air reading
// Route: POST /api/readings
router.post('/', readingController.createReading);

// Why it exists: Start or activate the 5-second background simulation loop
// Route: GET /api/readings/simulate
router.get('/simulate', readingController.simulateReadings);

module.exports = router;
