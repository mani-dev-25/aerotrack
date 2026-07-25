-- backend/schema.sql
-- Why this file exists: To set up the air quality database schema and insert initial seed readings.
-- What it does: Creates the 'air_quality_db' database, sets up the 'air_quality_readings' table with exact columns,
-- and inserts mock readings for realistic Chennai localities.

CREATE DATABASE IF NOT EXISTS air_quality_db;
USE air_quality_db;

-- Drop table if it exists to clean up any old fields
DROP TABLE IF EXISTS air_quality_readings;

-- Table definition for air quality records matching exact database fields
CREATE TABLE air_quality_readings (
    reading_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID of the reading (Auto-Increment)
    locality VARCHAR(100) NOT NULL,            -- Name of the area (e.g. Anna Nagar)
    pm_value INT NOT NULL,                     -- Particulate Matter value (PM index)
    level VARCHAR(20) NOT NULL,                -- Air quality category: Good, Moderate, Unhealthy, Danger
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Datetime of recording
    device_id VARCHAR(50) NOT NULL             -- Unique sensor identifier (e.g. DEV-AN01)
);

-- Seed data representing Chennai localities
-- Level Thresholds:
-- Good: 0 to 50
-- Moderate: 51 to 100
-- Unhealthy: 101 to 200
-- Danger: 201+
INSERT INTO air_quality_readings (locality, pm_value, level, device_id, recorded_at) VALUES

('Anna Nagar',28,'Good','AQM-ANN-001',NOW()-INTERVAL 20 HOUR),
('Adyar',42,'Good','AQM-ADY-001',NOW()-INTERVAL 19 HOUR),
('T Nagar',96,'Moderate','AQM-TNG-001',NOW()-INTERVAL 18 HOUR),
('Guindy',132,'Unhealthy','AQM-GDY-001',NOW()-INTERVAL 17 HOUR),
('Velachery',94,'Moderate','AQM-VEL-001',NOW()-INTERVAL 16 HOUR),
('Tambaram',104,'Unhealthy','AQM-TBM-001',NOW()-INTERVAL 15 HOUR),
('Medavakkam',58,'Moderate','AQM-MDV-001',NOW()-INTERVAL 14 HOUR),
('Pudhu Nagar',36,'Good','AQM-PDN-001',NOW()-INTERVAL 13 HOUR),
('Perumbakkam',81,'Moderate','AQM-PBK-001',NOW()-INTERVAL 12 HOUR),
('Pallikaranai',118,'Unhealthy','AQM-PLK-001',NOW()-INTERVAL 11 HOUR),
('Ponmar',43,'Good','AQM-PON-001',NOW()-INTERVAL 10 HOUR),
('Mambakkam',57,'Moderate','AQM-MBK-001',NOW()-INTERVAL 9 HOUR),
('Kelambakkam',97,'Moderate','AQM-KEL-001',NOW()-INTERVAL 8 HOUR),
('Navalur',89,'Moderate','AQM-NAV-001',NOW()-INTERVAL 7 HOUR),
('Siruseri',112,'Unhealthy','AQM-SIR-001',NOW()-INTERVAL 6 HOUR),
('Chromepet',60,'Moderate','AQM-CHR-001',NOW());