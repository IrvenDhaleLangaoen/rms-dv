const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

// MySQL Connection
const db = mysql.createConnection({
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


// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Extract month and year from the request body
        const { month, year } = req.body;

        // Create a directory path
        const dir = path.join(__dirname, '..', 'src', 'files', `${month}_${year}`);

        // Create the directory if it doesn't exist
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
                return cb(err, dir); // Pass error to the callback
            }
            cb(null, dir); // Use the created directory
        });
    },
    filename: (req, file, cb) => {
        // Use dvNumber as the filename with the original file extension
        const { dvNumber } = req.body;
        const ext = path.extname(file.originalname); // Get the file extension
        cb(null, `${dvNumber}${ext}`); // Set the filename to dvNumber.extension
    }
});

const upload = multer({ storage });

// Route to add an entry with file upload
router.post('/add', upload.single('file'), (req, res) => {
    const { month, year, dvNumber, jevNumber, userId } = req.body;
    const filePath = `src/files/${month}_${year}/${dvNumber}${path.extname(req.file.originalname)}`;
    console.log(month, year, dvNumber, jevNumber, userId)

    if (!month || !year || !dvNumber || !jevNumber || !userId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Query to check if the user exists in the dohis_user
    //  table
    const checkUserQuery = `SELECT username FROM dohis.dohis_user WHERE user_id = ?`;
    db2.query(checkUserQuery, [userId], (err, userResult) => {
        if (err) {
            console.error('Error fetching username:', err);
            return res.status(500).json({ message: 'Error fetching username.' });
        }

        if (userResult.length === 0) {
            console.log('User not found.')
            return res.status(404).json({ message: 'User not found.' });
        }

        const username = userResult[0].username;
        console.log(username);

        // Check if the DV Number or JEV Number already exists for the selected year
        const checkQuery = `SELECT * FROM rms_dv.dv_entries WHERE (dvNumber = ? OR jevNumber = ?) AND year = ?`;
        db.query(checkQuery, [dvNumber, jevNumber, year], (err, results) => {
            if (err) {
                console.error('Error checking for existing entries:', err);
                return res.status(500).json({ message: 'Error checking for existing entries.' });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: 'DV Number or JEV Number already exists for the selected year.' });
            }

            // Get the last ID to generate the new one
            const getLastIdQuery = `SELECT id FROM rms_dv.dv_entries ORDER BY id DESC LIMIT 1`;
            db.query(getLastIdQuery, (err, results) => {
                if (err) {
                    console.error('Error retrieving last ID:', err);
                    return res.status(500).json({ message: 'Error retrieving last ID.' });
                }

                let newId;
                if (results.length > 0) {
                    const lastId = results[0].id;
                    const lastNumber = parseInt(lastId.split('-')[2]);
                    const nextNumber = lastNumber + 1;
                    newId = `2024-DV-${String(nextNumber).padStart(6, '0')}`;
                } else {
                    newId = '2024-DV-000001';
                }

                // Insert the new entry into dv_entries
                const insertQuery = `INSERT INTO rms_dv.dv_entries (id, month, year, dvNumber, jevNumber, user_id, filePath)
                                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.query(insertQuery, [newId, month, year, dvNumber, jevNumber, userId, filePath], (err, results) => {
                    if (err) {
                        console.error('Error inserting entry:', err); // Log the full error object
                        return res.status(500).json({ message: 'Error inserting entry.', error: err }); // Send back the error for further inspection
                    }

                    // Log the action in the audit trail with the username
                    auditTrail(`Added new entry with DV Number ${dvNumber}`, username);

                    res.status(201).json({ message: 'Entry added successfully', entryId: newId });
                });

            });
        });
    });
});

// Get all entries without INNER JOIN
router.get('/', (req, res) => {
    // Query to fetch all entries from RMS DV system
    const queryEntries = `SELECT * FROM rms_dv.dv_entries`;

    db.query(queryEntries, (err, entriesResults) => {
        if (err) {
            console.error('Error fetching entries:', err);
            return res.status(500).json({ error: 'Failed to fetch entries' });
        }

        // If no entries found, return empty array
        if (entriesResults.length === 0) {
            return res.json([]);
        }

        // Function to fetch username for each entry from DOHIS system
        const fetchUsernames = (entry, callback) => {
            const queryUser = 'SELECT username FROM dohis.dohis_user WHERE user_id = ?';
            db2.query(queryUser, [entry.user_id], (err, userResults) => {
                if (err) {
                    console.error('Error fetching username:', err);
                    return callback(err);
                }

                // Append username to the entry object
                if (userResults.length > 0) {
                    entry.username = userResults[0].username;
                } else {
                    entry.username = 'Unknown';
                }

                callback(null, entry);
            });
        };

        // Process each entry to fetch corresponding username
        const processEntries = (entries, callback) => {
            let processedEntries = [];
            let pending = entries.length;

            entries.forEach((entry) => {
                fetchUsernames(entry, (err, updatedEntry) => {
                    if (err) {
                        return callback(err);
                    }

                    processedEntries.push(updatedEntry);
                    pending -= 1;

                    if (pending === 0) {
                        callback(null, processedEntries);
                    }
                });
            });
        };

        // Fetch usernames for all entries and return results
        processEntries(entriesResults, (err, finalResults) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to process entries' });
            }

            res.json(finalResults);
        });
    });
});

// Route to view a file by dvNumber
router.get('/view/:userId/:dvNumber', (req, res) => {
    const { userId, dvNumber } = req.params;

    // SQL query to fetch file path by dvNumber
    const query = `SELECT filePath FROM rms_dv.dv_entries WHERE dvNumber = ?`;

    db.query(query, [dvNumber], (err, results) => {
        if (err) {
            console.error('Error fetching file:', err);
            return res.status(500).json({ error: 'Failed to fetch file' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Extract the file path from the result
        const filePath = path.join(__dirname, '..', results[0].filePath);
        console.log(filePath);

        // Log the action in the audit trail before sending the file
        const getUserQuery = `SELECT username FROM dohis.dohis_user WHERE user_id = ?`;
        db2.query(getUserQuery, [userId], (err, userResult) => {
            if (err) {
                console.error('Error fetching username:', err);
                return res.status(500).json({ message: 'Error fetching username.' });
            }

            if (userResult.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const username = userResult[0].username;

            // Log the audit trail for viewing the file
            auditTrail(`Viewed file with DV Number ${dvNumber}`, username);

            // Send the file to the client
            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    return res.status(500).json({ message: 'Error sending file' });
                }
            });
        });
    });
});

// Use the PUT request without file upload
router.put('/edit/:userId/:id', async (req, res) => {
    const { userId, id } = req.params; // Extract userId and id from params
    const { dvNumber, jevNumber, filePath } = req.body;

    console.log(dvNumber, jevNumber, userId, filePath);

    // Check required fields
    if (!dvNumber || !jevNumber || !filePath) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check for existing entries with the same DV Number or JEV Number, excluding the current entry by id
    const checkQuery = `SELECT * FROM rms_dv.dv_entries WHERE (dvNumber = ? OR jevNumber = ?) AND id != ?`;
    db.query(checkQuery, [dvNumber, jevNumber, id], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking for existing entries.' });
        }
        if (results.length > 0) {
            return res.status(409).json({ message: 'DV Number or JEV Number already exists for the selected year.' });
        }

        // Proceed with renaming the file
        const extension = path.extname(filePath); // Get file extension from the original file
        const newFilePath = `src/files/${dvNumber}${extension}`; // New file path with the updated dvNumber

        try {
            await fsp.rename(filePath, newFilePath); // Use async file rename
            console.log(`File renamed to: ${newFilePath}`);

            // Proceed with updating the database
            const updateFields = [dvNumber, jevNumber, userId, newFilePath];
            const updateQuery = `UPDATE rms_dv.dv_entries SET dvNumber = ?, jevNumber = ?, user_id = ?, filePath = ? WHERE id = ?`;

            db.query(updateQuery, [...updateFields, id], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating entry.' });
                }

                // Log the action in the audit trail
                const getUserQuery = `SELECT username FROM dohis.dohis_user WHERE id = ?`;
                db2.query(getUserQuery, [userId], (err, userResult) => {
                    if (err) {
                        console.error('Error fetching username:', err);
                    } else if (userResult.length > 0) {
                        const username = userResult[0].username;
                        auditTrail(`Updated entry with DV Number ${dvNumber}`, username);
                    }

                    res.status(200).json({ message: 'Entry updated and file renamed successfully' });
                });
            });
        } catch (err) {
            console.error('Error renaming file:', err);
            return res.status(500).json({ message: 'Error renaming file.' });
        }
    });
});

// Route to download a file by entry ID
router.get('/download/:userId/:id', (req, res) => {
    const { userId, id } = req.params;

    // SQL query to fetch file path by entry ID
    const query = `SELECT filePath, dvNumber FROM rms_dv.dv_entries WHERE id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching file:', err);
            return res.status(500).json({ error: 'Failed to fetch file' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Extract the file path and DV Number from the result
        const filePath = path.join(__dirname, '..', results[0].filePath);
        const dvNumber = results[0].dvNumber; // Get the DV Number for the audit trail

        // Set response headers to trigger a file download
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).json({ message: 'Error sending file' });
            }

            // Log the download action in the audit trail
            const getUserQuery = `SELECT username FROM dohis.dohis_user WHERE user_id = ?`;
            db2.query(getUserQuery, [userId], (err, userResult) => {
                if (err) {
                    console.error('Error fetching username:', err);
                } else if (userResult.length > 0) {
                    const username = userResult[0].username;
                    auditTrail(`Downloaded file with DV Number ${dvNumber}`, username);
                }
            });
        });
    });
});

// Route to delete an entry by id and remove the associated file
router.delete('/delete/:userId/:id', (req, res) => {
    const { userId, id } = req.params;

    // SQL query to fetch file path by entry ID
    const query = `SELECT filePath, dvNumber FROM rms_dv.dv_entries WHERE id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching file:', err);
            return res.status(500).json({ message: 'Error fetching file information.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Entry not found.' });
        }

        // Extract the file path and DV Number from the result
        const filePath = path.join(__dirname, '..', results[0].filePath);
        const dvNumber = results[0].dvNumber; // Get the DV Number for the audit trail

        // Remove the file from the file system
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                // Optionally, you can choose to continue without response
            } else {
                console.log(`File deleted: ${filePath}`);
            }

            // SQL query to delete the entry from the database
            const deleteQuery = `DELETE FROM rms_dv.dv_entries WHERE id = ?`;

            db.query(deleteQuery, [id], (err, results) => {
                if (err) {
                    console.error('Error deleting entry from the database:', err);
                    return res.status(500).json({ message: 'Error deleting entry from the database.' });
                }

                // Log the delete action in the audit trail
                const getUserQuery = `SELECT username FROM dohis.dohis_user WHERE user_id = ?`;
                db2.query(getUserQuery, [userId], (err, userResult) => {
                    if (err) {
                        console.error('Error fetching username:', err);
                    } else if (userResult.length > 0) {
                        const username = userResult[0].username;
                        auditTrail(`Deleted entry with DV Number ${dvNumber}`, username);
                    }
                });

                res.status(200).json({ message: 'Entry deleted successfully.' });
            });
        });
    });
});

module.exports = router;
