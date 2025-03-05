const app = require('express')();
const { log } = require('../utils/logger');

const custom_tour_responsebody = require("../data/custom_tour_responsebody.json");



/**
 * 
 */
app.get('/custom-tour',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: custom_tour_responsebody
        })

    });




    
module.exports = app;