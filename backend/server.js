require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const auditRoutes = require('./routes/audit');  // Import audit routes

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Apply CORS middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.225.229:5173'],  // Allow requests from both localhost and 192.168.225.229
    credentials: true,  // Allow sending cookies (if needed)
}));

// MySQL Connection for the first database (RMS DV system)
const db1 = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// MySQL Connection for the second database (DOHIS system)
const db2 = mysql.createConnection({
    host: process.env.DOHIS_HOST,
    user: process.env.DOHIS_USER,
    password: process.env.DOHIS_PASSWORD,
    database: process.env.DOHIS_NAME
});

// Connect to the first database (RMS DV)
db1.connect((err) => {
    if (err) {
        console.error('First database (RMS DV) connection failed:', err);
    } else {
        console.log('Connected to the RMS DV MySQL database');

        // SQL query to create the entries table in the RMS DV database
        const createEntriesTableQuery = `
        CREATE TABLE IF NOT EXISTS dv_entries (
            id VARCHAR(255) PRIMARY KEY,
            month INT NOT NULL,
            year INT NOT NULL,
            dvNumber VARCHAR(255) NOT NULL,
            jevNumber VARCHAR(255) NOT NULL,
            user_id INT NOT NULL,
            time_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            time_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );`;

        db1.query(createEntriesTableQuery, (err, results) => {
            if (err) {
                console.error('Error creating entries table in RMS DV database:', err);
            } else {
                console.log('Entries table created or already exists in RMS DV database');
            }
        });
    }
});

// Connect to the second database (DOHIS)
db2.connect((err) => {
    if (err) {
        console.error('Second database (DOHIS) connection failed:', err);
    } else {
        console.log('Connected to the DOHIS MySQL database');

        // Example: Check if a specific table exists in the DOHIS database
        const checkDOHISTableQuery = 'SHOW TABLES LIKE "dohis.dohis_user";';
        db2.query(checkDOHISTableQuery, (err, results) => {
            if (err) {
                console.error('Error checking table in DOHIS database:', err);
            } else {
                console.log('DOHIS database check successful:', results);
            }
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api', auditRoutes);  // The audit trail is now available at /api/audit

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
