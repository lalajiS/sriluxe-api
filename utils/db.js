const { log } = require('./logger');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./internal_db.db', (err) => {
    if (err) {
        log.error(`Error opening database:  ${err.message}`);
    } else {
        log.info('Connected to the SQLite database.');
    }
});



// initialise DB tables
db.serialize(() => {

    const custom_tour_reqs = (`
        CREATE TABLE IF NOT EXISTS 
        custom_tour_reqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            phone_code TEXT,
            phone_number TEXT,
            name TEXT,
            country TEXT,
            starting_date TEXT,
            ending_date TEXT,
            group_type TEXT,
            luxury_level TEXT,
            activity_level TEXT,
            cultural_depth TEXT,
            wildlife_focus TEXT,
            user_agent TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    const contact_reqs = (`
        CREATE TABLE IF NOT EXISTS 
        contact_reqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            phone_number TEXT,
            name TEXT,
            purpose TEXT,
            message TEXT,
            user_agent TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);


        db.run(custom_tour_reqs, (err) => {
            if (err) log.error(`DB custom_tour_reqs : ${err.message}`);
        });
        
        db.run(contact_reqs, (err) => {
            if (err) log.error(`DB contact_reqs : ${err.message}`);
        });
    
});



// Middleware to save request body
const saveCustomTourRequest = (req, res, next) => {
    const { email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus } = req.body;
    const userAgent = req.headers['user-agent'];

    db.run(`INSERT INTO custom_tour_reqs (email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus, userAgent], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        req.savedRequestId = this.lastID;
        next();
    });
};
const saveContactRequest = (req, res, next) => {
    const { email, phone_number, name, purpose, message } = req.body;
    const userAgent = req.headers['user-agent'];

    db.run(`INSERT INTO contact_reqs (email, phone_number, name, purpose, message, user_agent) VALUES (?, ?, ?, ?, ?, ?)`, [email, phone_number, name, purpose, message, userAgent], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        req.savedRequestId = this.lastID;
        next();
    });
};



// Functions to get all records
const getAllCustomTourRequests = (req, res) => {
    db.all('SELECT * FROM custom_tour_reqs', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(rows);
    });
};
const getAllContactRequests = (req, res) => {
    db.all('SELECT * FROM contact_reqs', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(rows);
    });
};



module.exports = { 
    db, 
    saveContactRequest, 
    saveCustomTourRequest, 
    getAllContactRequests,
    getAllCustomTourRequests,
};
