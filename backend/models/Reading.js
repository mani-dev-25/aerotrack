// backend/models/Reading.js
// Why it exists:
// This is the Model layer for the Air Quality dashboard. It encapsulates all direct MySQL 
// interactions, separating database queries from route controller logic. It uses exact 
// database field names (reading_id, locality, pm_value, level, recorded_at, device_id).

const db = require('../config/db');

// Why it exists:
// Helper function to map a PM index value to an air quality category level.
// Inputs: pmValue (integer)
// Outputs: string representing air quality level ('Good', 'Moderate', 'Unhealthy', 'Danger')
// Important logic: 
// Categorizes PM value into ranges:
// - Good: 0 to 50
// - Moderate: 51 to 100
// - Unhealthy: 101 to 200
// - Danger: 201+
function calculateLevel(pmValue) {
  const pm = parseInt(pmValue);
  if (pm <= 50) return 'Good';
  if (pm <= 100) return 'Moderate';
  if (pm <= 200) return 'Unhealthy';
  return 'Danger';
}

const Reading = {

  // Why it exists:
  // To retrieve air quality records from the database, allowing searches by locality or filter by air level.
  // Inputs: localitySearch (string or null), levelFilter (string or null)
  // Outputs: Array of reading objects
  // What it does:
  // Assembles a SQL SELECT statement dynamically using filter parameters and query placeholders (?).
  getAll: async (localitySearch, levelFilter) => {
    let sql = 'SELECT * FROM air_quality_readings';
    const params = [];
    const conditions = [];

    // Search by locality parameter if provided
    if (localitySearch) {
      conditions.push('locality LIKE ?');
      params.push(`%${localitySearch}%`);
    }

    // Filter by air level classification if provided
    if (levelFilter) {
      conditions.push('level = ?');
      params.push(levelFilter);
    }

    // Append WHERE filters if any exist
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort showing the most recent air readings first
    sql += ' ORDER BY recorded_at DESC';

    // Execute query asynchronously
    const [rows] = await db.query(sql, params);
    return rows;
  },

  // Why it exists:
  // To aggregate metrics for the dashboard summary cards and stats panels.
  // Outputs: Object containing counts for each level (good, moderate, unhealthy, danger),
  //          overall average pm_value, and total records.
  // What it does:
  // Fires separate queries to count entries in each category and compute the average PM value.
  getStats: async () => {
    // Count readings group by air level category
    const levelSql = `
      SELECT level, COUNT(*) as count 
      FROM air_quality_readings 
      GROUP BY level
    `;
    const [levelRows] = await db.query(levelSql);

    // Calculate overall record count and average pm_value
    const summarySql = `
      SELECT COUNT(*) as totalCount, AVG(pm_value) as avgPm 
      FROM air_quality_readings
    `;
    const [summaryRows] = await db.query(summarySql);

    // Initialize statistics dictionary with default values
    const stats = {
      good: 0,
      moderate: 0,
      unhealthy: 0,
      danger: 0,
      total: summaryRows[0].totalCount || 0,
      averagePm: Math.round(summaryRows[0].avgPm || 0)
    };

    // Populate actual counts from the database output rows
    levelRows.forEach(row => {
      const key = row.level.toLowerCase();
      if (key === 'good') stats.good = row.count;
      else if (key === 'moderate') stats.moderate = row.count;
      else if (key === 'unhealthy') stats.unhealthy = row.count;
      else if (key === 'danger') stats.danger = row.count;
    });

    return stats;
  },

  // Why it exists:
  // To retrieve chronological PM index trends for Chart.js graphing.
  // Outputs: Chronologically sorted list of the latest 15 readings
  // What it does:
  // Queries the 15 most recent readings, then reverses the result array so the horizontal x-axis flow represents time.
  getTrendData: async () => {
    const sql = `
      SELECT locality, pm_value, recorded_at 
      FROM air_quality_readings 
      ORDER BY recorded_at DESC 
      LIMIT 15
    `;
    const [rows] = await db.query(sql);

    // Reverse array to place the oldest of the 15 values on the left
    return rows.reverse();
  },

  // Why it exists:
  // To retrieve historical PM values for a specific device, needed to calculate moving averages.
  // Inputs: deviceId (string), limit (integer)
  // Outputs: Array of numerical pm_values
  // What it does:
  // Queries DB for the latest N records belonging to a particular device_id.
  getRecentPmValuesByDevice: async (deviceId, limit) => {
    const sql = `
      SELECT pm_value 
      FROM air_quality_readings 
      WHERE device_id = ? 
      ORDER BY recorded_at DESC 
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [deviceId, parseInt(limit)]);
    
    // Map database rows into a simple array of numbers
    return rows.map(row => row.pm_value);
  },

  // Why it exists:
  // To write a new air quality reading into the database.
  // Inputs: data (object containing: locality, pm_value, device_id)
  // Outputs: Created reading object with its database ID and calculated level
  // What it does:
  // Calculates level category from PM, and runs SQL INSERT.
  create: async (data) => {
    // Generate the classification level (Good, Moderate, Unhealthy, Danger) from PM
    const level = calculateLevel(data.pm_value);

    const sql = `
      INSERT INTO air_quality_readings 
      (locality, pm_value, level, device_id) 
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      data.locality,
      parseInt(data.pm_value),
      level,
      data.device_id
    ];

    const [result] = await db.query(sql, params);
    
    return {
      reading_id: result.insertId,
      locality: data.locality,
      pm_value: parseInt(data.pm_value),
      level,
      device_id: data.device_id,
      recorded_at: new Date()
    };
  }
};

module.exports = Reading;
module.exports.calculateLevel = calculateLevel; // Export helper for use in validation testing
