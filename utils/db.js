const { log } = require('./logger');

const mysql = require('mysql2');
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
});




// Middleware to save request body
// Middleware to save generated custom tour
const saveGeneratedCustomTour = (req, res, next) => {
    log.info('saveGeneratedCustomTour called: ' + JSON.stringify({ body: req.body }));
    const { title, banner, description, num_of_days, price, itenerary, custom_tour_req_id } = req.body.custom_tour;
    const iteneraryStr = JSON.stringify(itenerary);
    db.query(
        `INSERT INTO generated_custom_tours (title, banner, description, num_of_days, price, itenerary, custom_tour_req_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, banner, description, num_of_days, price, iteneraryStr, custom_tour_req_id],
        (err, results) => {
            if (err) log.error('saveGeneratedCustomTour error: ' + JSON.stringify({ error: err, values: [title, banner, description, num_of_days, price, iteneraryStr, custom_tour_req_id] }));
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            log.info('saveGeneratedCustomTour success: ' + JSON.stringify({ insertId: results.insertId }));
            req.savedGeneratedTourId = results.insertId;
            next();
        }
    );
};
const saveCustomTourRequest = (req, res, next) => {
    log.info('saveCustomTourRequest called: ' + JSON.stringify({ body: req.body }));
    const { email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus } = req.body;
    const userAgent = req.headers['user-agent'];
    db.query(
        `INSERT INTO custom_tour_reqs (email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus, userAgent],
        (err, results) => {
            if (err) log.error('saveCustomTourRequest error: ' + JSON.stringify({ error: err, values: [email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, luxury_level, activity_level, cultural_depth, wildlife_focus, userAgent] }));
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            log.info('saveCustomTourRequest success: ' + JSON.stringify({ insertId: results.insertId }));
            req.savedRequestId = results.insertId;
            next();
        }
    );
};
const saveTourEnquiryRequest = (req, res, next) => {
    log.info('saveTourEnquiryRequest called: ' + JSON.stringify({ body: req.body }));
    const { email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id } = req.body;
    const userAgent = req.headers['user-agent'];
    db.query(
        `INSERT INTO tour_enquiry_reqs (email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id, userAgent],
        (err, results) => {
            if (err) log.error('saveTourEnquiryRequest error: ' + JSON.stringify({ error: err, values: [email, phone_code, phone_number, name, country, starting_date, ending_date, group_type, tour_id, userAgent] }));
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            log.info('saveTourEnquiryRequest success: ' + JSON.stringify({ insertId: results.insertId }));
            req.savedRequestId = results.insertId;
            next();
        }
    );
};
const saveContactRequest = (req, res, next) => {
    log.info('saveContactRequest called: ' + JSON.stringify({ body: req.body }));
    const { email, phone_number, name, purpose, message } = req.body;
    const userAgent = req.headers['user-agent'];
    db.query(
        `INSERT INTO contact_reqs (email, phone_number, name, purpose, message, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, phone_number, name, purpose, message, userAgent],
        (err, results) => {
            if (err) log.error('saveContactRequest error: ' + JSON.stringify({ error: err, values: [email, phone_number, name, purpose, message, userAgent] }));
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            log.info('saveContactRequest success: ' + JSON.stringify({ insertId: results.insertId }));
            req.savedRequestId = results.insertId;
            next();
        }
    );
};



// Functions to get all records
// Function to get all generated custom tours
const getAllGeneratedCustomTours = (req, res) => {
    log.info('getAllGeneratedCustomTours called');
    db.query('SELECT * FROM generated_custom_tours', [], (err, rows) => {
        if (err) log.error('getAllGeneratedCustomTours error: ' + JSON.stringify({ error: err }));
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Parse itinerary JSON for each row
        const parsedRows = rows.map(row => ({
            ...row,
            itenerary: row.itenerary
                ? (typeof row.itenerary === 'string' ? JSON.parse(row.itenerary) : row.itenerary)
                : []
        }));
        log.info('getAllGeneratedCustomTours success: ' + JSON.stringify({ count: parsedRows.length }));
        return res.json(parsedRows);
    });
};

// Middleware to get combined custom_tour_req and generated_custom_tour by custom_tour_req_id
const getFullCustomTourData = (req, res, next) => {
    log.info('getFullCustomTourData called: ' + JSON.stringify({ body: req.body }));
    const { custom_tour_req_id, custom_tour_id } = req.body;
    db.query('SELECT * FROM custom_tour_reqs WHERE id = ?', [custom_tour_req_id], (err, reqResults) => {
        if (err) log.error('getFullCustomTourData custom_tour_reqs error: ' + JSON.stringify({ error: err }));
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!reqResults || reqResults.length === 0) {
            return res.status(404).json({ error: 'Custom tour request not found' });
        }
        const reqRow = reqResults[0];
        db.query('SELECT * FROM generated_custom_tours WHERE custom_tour_id = ?', [custom_tour_id], (err, tourResults) => {
            if (err) log.error('getFullCustomTourData generated_custom_tours error: ' + JSON.stringify({ error: err }));
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!tourResults || tourResults.length === 0) {
                return res.status(404).json({ error: 'Generated custom tour not found' });
            }
            const tourRow = tourResults[0];
            tourRow.itenerary = tourRow.itenerary
                ? (typeof tourRow.itenerary === 'string' ? JSON.parse(tourRow.itenerary) : tourRow.itenerary)
                : [];
            req.tour_data = ({
                // Optionally log the combined data
                // log.info('getFullCustomTourData success', { custom_tour_request: reqRow, generated_custom_tour: tourRow });
                custom_tour_request: reqRow,
                generated_custom_tour: tourRow
            });
            log.info('getFullCustomTourData success: ' + JSON.stringify({ custom_tour_req_id, custom_tour_id }));
            return next();
        });
    });
};

// Function to get generated custom tour by custom_tour_id
const getGeneratedCustomTourByReqId = (req, res) => {
    log.info('getGeneratedCustomTourByReqId called: ' + JSON.stringify({ params: req.params }));
    const { custom_tour_id } = req.params;
    db.query('SELECT * FROM generated_custom_tours WHERE custom_tour_id = ?', [custom_tour_id], (err, results) => {
        if (err) log.error('getGeneratedCustomTourByReqId error: ' + JSON.stringify({ error: err }));
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Custom tour not found' });
        }
        const row = results[0];
        row.itenerary = row.itenerary
            ? (typeof row.itenerary === 'string' ? JSON.parse(row.itenerary) : row.itenerary)
            : [];
        log.info('getGeneratedCustomTourByReqId success: ' + JSON.stringify({ custom_tour_id }));
        return res.json(row);
    });
};
const getAllCustomTourRequests = (req, res) => {
    log.info('getAllCustomTourRequests called');
    db.query('SELECT * FROM custom_tour_reqs', [], (err, rows) => {
        if (err) log.error('getAllCustomTourRequests error: ' + JSON.stringify({ error: err }));
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        log.info('getAllCustomTourRequests success: ' + JSON.stringify({ count: rows.length }));
        return res.json(rows);
    });
};
const getAllTourEnquiryRequests = (req, res) => {
    log.info('getAllTourEnquiryRequests called');
    db.query('SELECT * FROM tour_enquiry_reqs', [], (err, rows) => {
        if (err) log.error('getAllTourEnquiryRequests error: ' + JSON.stringify({ error: err }));
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        log.info('getAllTourEnquiryRequests success: ' + JSON.stringify({ count: rows.length }));
        return res.json(rows);
    });
};
const getAllContactRequests = (req, res) => {
    log.info('getAllContactRequests called');
    db.query('SELECT * FROM contact_reqs', [], (err, rows) => {
        if (err) log.error('getAllContactRequests error: ' + JSON.stringify({ error: err }));
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        log.info('getAllContactRequests success: ' + JSON.stringify({ count: rows.length }));
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