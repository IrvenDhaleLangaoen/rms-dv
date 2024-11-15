const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Route to get the audit trail
router.get('/audit', (req, res) => {
    const auditTrailPath = path.join(__dirname, 'audit-trail.txt');
    console.log(auditTrailPath);

    // Read the audit-trail.txt file
    fs.readFile(auditTrailPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading audit trail:', err);
            return res.status(500).json({ message: 'Failed to retrieve audit trail' });
        }

        // Send the content of the audit trail
        res.status(200).json({ auditTrail: data });
    });
});

module.exports = router;
