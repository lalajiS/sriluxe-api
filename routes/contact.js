const app = require('express')();
const { log } = require('../utils/logger');
const { 
    saveContactRequest,
    getAllContactRequests } = require('../utils/db');

const custom_tour_responsebody = require("../data/custom_tour_responsebody.json");




/**
 * 
 */
app.post('/form',
    // secure_prod,
    // auth_credentials,
    saveContactRequest,
    (req, res) => {
        
        return res.send({
            status: true,
            statusText: 'Successful'
        })

    });



/**
 * 
 */
app.get('/get-all-requests', getAllContactRequests );


    
module.exports = app;