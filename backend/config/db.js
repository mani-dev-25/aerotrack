// backend/config/db.js
// Why it exists: 
// This file sets up and configures the connection pool to the MySQL database.
// Utilizing a connection pool is a best practice to handle database operations efficiently
// without opening and closing connections repeatedly.

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// What it does:
// Loads environment variables from the .env file in the backend root directory.
dotenv.config();

// What each important line does:
// mysql.createPool configuration creates a group of reusable database connections.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',          // The hostname where the MySQL server runs (e.g., localhost)
  user: process.env.DB_USER || 'root',               // The username to log in to the database
  password: process.env.DB_PASSWORD || '',           // The password for database access
  database: process.env.DB_NAME || 'air_quality_db', // The specific database name we want to connect to
  port: process.env.DB_PORT || 3306,                 // The default port MySQL listens to (3306)
  waitForConnections: true,                          // If pool limit is reached, wait in a queue instead of failing
  connectionLimit: 10,                               // Max number of simultaneous active connections allowed
  queueLimit: 0                                      // Unlimited queue for waiting connections
});

// Why it exists:
// To verify the database configuration and check if the database is reachable when starting the server.
// What it does:
// Requests a temporary connection from the pool, prints a success log, and releases it back to the pool.
async function testConnection() {
  try {
    // Get a connection client from the pool to run a check
    const connection = await pool.getConnection();
    console.log('Database Status: Connection to MySQL database pool established successfully.');
    
    // Release the connection back to the pool so it can be reused by incoming HTTP requests
    connection.release();
  } catch (error) {
    console.error('Database Status Error: Unable to connect to the MySQL database.');
    console.error(`Reason: ${error.message}`);
    console.error('Please make sure MySQL service is running and DB credentials in .env are correct.');
  }
}

// Invoke the test connection function immediately when this config file is loaded
testConnection();

// Export the connection pool so that database models can query it
module.exports = pool;
