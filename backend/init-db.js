// backend/init-db.js
// Why it exists:
// This script automatically initializes the MySQL database. It reads 'schema.sql' and runs it,
// ensuring the 'air_quality_db' database and tables exist. It avoids requiring the user to manually
// copy-paste SQL commands in another tool.

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (.env) containing MySQL host, user, and password
dotenv.config();

async function initializeDatabase() {
  console.log('================================================================');
  console.log('  DATABASE INITIALIZER RUNNING                                  ');
  console.log(`  Connecting to MySQL host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  console.log('================================================================');

  // Open connection without selecting a DB name, in case the database does not exist yet
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true // Crucial: Allows running the entire schema.sql queries in one batch
  });

  try {
    // Locate and read the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    console.log('[MySQL] Executing schema.sql statements...');
    
    // Execute all query commands batch-wise
    await connection.query(sqlContent);

    console.log('[MySQL] Database created/initialized successfully.');
    console.log('[MySQL] Chennai seed locality data populated.');
    console.log('================================================================');
  } catch (error) {
    console.error('❌ Database Initialization Failed!');
    console.error(`Reason: ${error.message}`);
    console.error('\nEnsure MySQL service is running and credentials in .env are correct.');
    console.log('================================================================');
  } finally {
    // Terminate connection client
    await connection.end();
  }
}

// Run the function
initializeDatabase();
