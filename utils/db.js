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

    const tour_enquiry_reqs = (`
        CREATE TABLE IF NOT EXISTS 
        tour_enquiry_reqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            phone_code TEXT,
            phone_number TEXT,
            name TEXT,
            country TEXT,
            starting_date TEXT,
            ending_date TEXT,
            group_type TEXT,
            tour_id TEXT,
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

    const generated_custom_tours = (`
        CREATE TABLE IF NOT EXISTS 
        generated_custom_tours (
            custom_tour_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            banner TEXT,
            description TEXT,
            num_of_days INTEGER,
            price TEXT,
            itenerary TEXT,
            custom_tour_req_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(custom_tour_reqs, (err) => {
            if (err) log.error(`DB custom_tour_reqs : ${err.message}`);
        });

        db.run(tour_enquiry_reqs, (err) => {
            if (err) log.error(`DB tour_enquiry_reqs : ${err.message}`);
        });
        
        db.run(contact_reqs, (err) => {
            if (err) log.error(`DB contact_reqs : ${err.message}`);
        });

            db.run(generated_custom_tours, (err) => {
                if (err) log.error(`DB generated_custom_tours : ${err.message}`);
            });
    
});



// Middleware to save request body
// Middleware to save generated custom tour
const saveGeneratedCustomTour = (req, res, next) => {
    const { title, banner, description, num_of_days, price, itenerary, custom_tour_req_id } = req.body.custom_tour;
    const iteneraryStr = JSON.stringify(itenerary);
    db.run(
        `INSERT INTO generated_custom_tours (title, banner, description, num_of_days, price, itenerary, custom_tour_req_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, banner, description, num_of_days, price, iteneraryStr, custom_tour_req_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            req.savedGeneratedTourId = this.lastID;
            next();
        }
    );
};
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
const saveTourEnquiryRequest = (req, res, next) => {
    const { email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id } = req.body;
    const userAgent = req.headers['user-agent'];

    db.run(`INSERT INTO tour_enquiry_reqs (email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id, userAgent], function (err) {
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
// Function to get all generated custom tours
const getAllGeneratedCustomTours = (req, res) => {
    db.all('SELECT * FROM generated_custom_tours', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Parse itinerary JSON for each row
        const parsedRows = rows.map(row => ({
            ...row,
            itenerary: row.itenerary ? JSON.parse(row.itenerary) : []
        }));
        return res.json(parsedRows);
    });
};

// Middleware to get combined custom_tour_req and generated_custom_tour by custom_tour_req_id
const getFullCustomTourData = (req, res, next) => {
    const { custom_tour_req_id, custom_tour_id } = req.body;
    db.get('SELECT * FROM custom_tour_reqs WHERE id = ?', [custom_tour_req_id], (err, reqRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!reqRow) {
            return res.status(404).json({ error: 'Custom tour request not found' });
        }
        db.get('SELECT * FROM generated_custom_tours WHERE custom_tour_id = ?', [custom_tour_id], (err, tourRow) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!tourRow) {
                return res.status(404).json({ error: 'Generated custom tour not found' });
            }
            tourRow.itenerary = tourRow.itenerary ? JSON.parse(tourRow.itenerary) : [];
            // Combine and send
            req.tour_data = ({
                custom_tour_request: reqRow,
                generated_custom_tour: tourRow
            });

            return next();
        });
    });
};

// Function to get generated custom tour by custom_tour_id
const getGeneratedCustomTourByReqId = (req, res) => {
    const { custom_tour_id } = req.params;
    db.get('SELECT * FROM generated_custom_tours WHERE custom_tour_id = ?', [custom_tour_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Custom tour not found' });
        }
        // Parse itinerary JSON
        row.itenerary = row.itenerary ? JSON.parse(row.itenerary) : [];
        return res.json(row);
    });
};
const getAllCustomTourRequests = (req, res) => {
    db.all('SELECT * FROM custom_tour_reqs', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(rows);
    });
};
const getAllTourEnquiryRequests = (req, res) => {
    db.all('SELECT * FROM tour_enquiry_reqs', [], (err, rows) => {
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
    saveTourEnquiryRequest, 
    getAllContactRequests,
    getAllCustomTourRequests,
    getAllTourEnquiryRequests,
    saveGeneratedCustomTour,
    getAllGeneratedCustomTours,
    getGeneratedCustomTourByReqId,
    getFullCustomTourData
};