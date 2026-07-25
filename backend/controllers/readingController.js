// backend/controllers/readingController.js
// Why it exists:
// This controller acts as the intermediate coordinator in our MVC architecture. It receives HTTP requests,
// invokes database operations in the Reading model, applies validation rules, runs the simulation loop,
// and packages the responses into JSON format.

const Reading = require('../models/Reading');

// List of Chennai localities and matching sensor device IDs for simulation
const LOCALITIES = [
  { name: 'Anna Nagar', deviceId: 'AQM-ANN-001' },
  { name: 'Adyar', deviceId: 'AQM-ADY-001' },
  { name: 'T Nagar', deviceId: 'AQM-TNG-001' },
  { name: 'Guindy', deviceId: 'AQM-GDY-001' },
  { name: 'Velachery', deviceId: 'AQM-VEL-001' },
  { name: 'Tambaram', deviceId: 'AQM-TBM-001' },

  { name: 'Medavakkam', deviceId: 'AQM-MDV-001' },
  { name: 'Pudhu Nagar', deviceId: 'AQM-PDN-001' },
  { name: 'Perumbakkam', deviceId: 'AQM-PBK-001' },
  { name: 'Pallikaranai', deviceId: 'AQM-PLK-001' },

  { name: 'Ponmar', deviceId: 'AQM-PON-001' },
  { name: 'Mambakkam', deviceId: 'AQM-MBK-001' },
  { name: 'Kelambakkam', deviceId: 'AQM-KEL-001' },
  { name: 'Navalur', deviceId: 'AQM-NAV-001' },
  { name: 'Siruseri', deviceId: 'AQM-SIR-001' },
  { name: 'Chromepet', deviceId: 'AQM-CHR-001' }
];  

// Simulator state variables
let simulationInterval = null;
let isSimulating = false;

// Why it exists:
// Fetch readings from the database, supporting search filters for locality and level classification.
// Inputs: req.query.locality (string), req.query.level (string)
// Outputs: JSON array of matching readings
exports.getAllReadings = async (req, res) => {
  try {
    const { locality, level } = req.query;
    
    // Call the model with search parameters
    const readings = await Reading.getAll(locality, level);
    
    res.status(200).json(readings);
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({ error: 'Failed to retrieve air quality logs from database.' });
  }
};

// Why it exists:
// Aggregate statistical counts (Good, Moderate, Unhealthy, Danger) for dashboard information displays.
// Outputs: JSON stats object containing totals and average PM level
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Reading.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to compute dashboard metrics.' });
  }
};

// Why it exists:
// Fetch historical PM levels sorted chronologically for rendering simple line charts.
// Outputs: JSON array of recent PM values and timestamp strings
exports.getTrendData = async (req, res) => {
  try {
    const trendData = await Reading.getTrendData();
    res.status(200).json(trendData);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Failed to retrieve PM trend values.' });
  }
};

// Why it exists:
// Validate and create a manual reading entry.
// Inputs: req.body (locality, pm_value, device_id)
// Outputs: JSON of the inserted record or 400 Bad Request error
exports.createReading = async (req, res) => {
  try {
    const { locality, pm_value, device_id } = req.body;

    // 1. Validation for Missing Values
    if (!locality || pm_value === undefined || !device_id) {
      return res.status(400).json({ 
        error: 'Validation Error: Locality, PM Value, and Device ID are required.' 
      });
    }

    // 2. Validation for Impossible Values
    // PM values less than 0 or greater than 500 are considered logically impossible for sensor input
    const numericPm = parseInt(pm_value);
    if (isNaN(numericPm) || numericPm < 0 || numericPm > 500) {
      return res.status(400).json({ 
        error: 'Validation Error: Impossible Value. PM Value must be a valid integer between 0 and 500.' 
      });
    }

    // Insert record via the model
    const newRecord = await Reading.create({
      locality,
      pm_value: numericPm,
      device_id
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error adding reading manually:', error);
    res.status(500).json({ error: 'Failed to log air quality reading.' });
  }
};

// Why it exists:
// Triggers or manages the background 5-second generator loop (simulator).
// Route: GET /simulate (or /api/readings/simulate)
// Outputs: JSON stating current simulation state
exports.simulateReadings = async (req, res) => {
  try {
    // If the loop is already running, just return success status
    if (isSimulating) {
      return res.status(200).json({
        success: true,
        message: 'Simulation engine is already active and running.',
        status: 'active'
      });
    }

    isSimulating = true;
    console.log('[Simulator Engine] Starting background loop (interval: 5s)...');

    // Run the generator block every 5 seconds
    simulationInterval = setInterval(async () => {
      try {
        // 1. Generate random locality & device ID
        const randomLocality = LOCALITIES[Math.floor(Math.random() * LOCALITIES.length)];
        
        // 2. Generate a random PM value
        // We range from -50 to 650. This generates realistic numbers but occasionally triggers
        // impossible values (negative or >500) to test that our validator rejects them.
        const rawPm = Math.floor(Math.random() * 700) - 50;

        console.log(`[Simulator] Generated Raw PM Value: ${rawPm} for ${randomLocality.name} (${randomLocality.deviceId})`);

        // 3. Reject Impossible Values
        if (rawPm < 0 || rawPm > 500) {
          console.warn(`[Simulator] REJECTED: Value ${rawPm} is outside the valid range [0, 500]. Skipping database insert.`);
          return; // Stop processing this step
        }

        // 4. Retrieve last 2 PM readings for this device from DB to calculate Simple Moving Average
        const previousPmValues = await Reading.getRecentPmValuesByDevice(randomLocality.deviceId, 2);
        
        let smoothedPm = rawPm;
        if (previousPmValues.length === 2) {
          // Average of the current generated value and 2 historical database values
          smoothedPm = Math.round((previousPmValues[0] + previousPmValues[1] + rawPm) / 3);
          console.log(`[Simulator] Moving Average Applied: (${previousPmValues[0]} + ${previousPmValues[1]} + ${rawPm}) / 3 = ${smoothedPm}`);
        } else if (previousPmValues.length === 1) {
          // Average of 1 historical value and current generated value
          smoothedPm = Math.round((previousPmValues[0] + rawPm) / 2);
          console.log(`[Simulator] Moving Average Applied: (${previousPmValues[0]} + ${rawPm}) / 2 = ${smoothedPm}`);
        } else {
          console.log(`[Simulator] First record for device. Saving raw value: ${smoothedPm}`);
        }

        // 5. Insert the averaged value into MySQL
        const savedRecord = await Reading.create({
          locality: randomLocality.name,
          pm_value: smoothedPm,
          device_id: randomLocality.deviceId
        });

        console.log(`[Simulator] INSERTED: Locality: ${savedRecord.locality}, PM: ${savedRecord.pm_value}, Level: ${savedRecord.level}`);
      } catch (err) {
        console.error('[Simulator Loop Error]:', err.message);
      }
    }, 5000);

    res.status(200).json({
      success: true,
      message: 'Air Quality simulator started successfully.',
      status: 'active'
    });
  } catch (error) {
    console.error('Error starting simulator:', error);
    res.status(500).json({ error: 'Failed to initialize simulator engine.' });
  }
};

// Automatically start the simulator on backend startup so dashboard immediately reflects activity
exports.startSimulatorAutomatically = () => {
  if (!isSimulating) {
    // Invoke simulateReadings by mocking req/res objects
    const mockReq = {};
    const mockRes = {
      status: () => ({
        json: (data) => console.log('[Simulator Auto-Start]', data.message)
      })
    };
    exports.simulateReadings(mockReq, mockRes);
  }
};
