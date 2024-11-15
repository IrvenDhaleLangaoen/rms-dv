const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createHash } = require('node:crypto');
const router = express.Router();

// MySQL connection to DOHIS database
const dbDOHIS = mysql.createConnection({
    host: process.env.DOHIS_HOST,
    user: process.env.DOHIS_USER,
    password: process.env.DOHIS_PASSWORD,
    database: process.env.DOHIS_NAME
});

// Helper function for audit trail
const auditTrail = (action, username) => {
    const logPath = path.join(__dirname, 'audit-trail.txt');

    // Get current date and time
    const now = new Date();

    // Format the date to a readable format (e.g., "October 14, 2024, 2:30 PM")
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(now);

    const logEntry = `${formattedDate} - ${action} by ${username}\n`;

    fs.appendFile(logPath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to audit trail:', err);
        } else {
            console.log('Audit trail updated:', logEntry);
        }
    });
};

// Register a new user
// router.post('/register', async (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ msg: 'Please enter all fields' });
//     }

//     // Check if the user already exists in the dohis_user table
//     dbDOHIS.query('SELECT * FROM dohis_user WHERE username = ?', [username], async (err, result) => {
//         if (err) throw err;

//         if (result.length > 0) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         console.log('Hashed Password for Registration:', hashedPassword);

//         // Insert user into the DOHIS database
//         dbDOHIS.query('INSERT INTO dohis_user (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
//             if (err) throw err;

//             // Log to audit trail
//             auditTrail('User Registration', username);

//             res.status(201).json({ msg: 'User registered successfully' });
//         });
//     });
// });

// Sign off (instead of logout)
router.post('/signoff', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ msg: 'Username is required' });
    }
    auditTrail('User Logout', username);
    res.status(200).json({ msg: 'User logged out successfully' });
});

// Login a user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    console.log('Trying to log in with username:', username); // Log the username being used

    // Check if user exists in dohis_user table
    dbDOHIS.query('SELECT * FROM dohis_user WHERE username = ?', [username], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ msg: 'Database error' });
        }

        console.log('Query result:', result); // Log the result

        if (result.length === 0) {
            return res.status(400).json({ msg: 'User does not exist' });
        }

        const user = result[0];

        // Hash the provided password using MD5
        const md5Hash = createHash('md5').update(password).digest('hex');

        // Check password (using MD5)
        if (md5Hash !== user.password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create and send JWT token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Log to audit trail
        auditTrail('User Login', username);

        res.json({
            token,
            userId: user.user_id, // Explicitly send user_id
            username: user.username // Also returning username for completeness
        });
    });
});

module.exports = router;
