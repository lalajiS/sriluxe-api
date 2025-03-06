const app = require('express')();
const { log } = require('../utils/logger');
const { 
    saveCustomTourRequest,
    getAllCustomTourRequests } = require('../utils/db');
const { 
    tourDays,
    generateItinerary } = require('../utils/tours');

const custom_tour_responsebody = require("../data/custom_tour_responsebody.json");



/**
 * 
 */
app.post('/custom-tour',
    // secure_prod,
    // auth_credentials,
    saveCustomTourRequest,
    (req, res) => {

        let tour_days     = tourDays(req.body.starting_date, req.body.ending_date);
        let response_body = { ...custom_tour_responsebody };

        response_body.num_of_days = tour_days;
        response_body.title       = (`${tour_days} Days Custom Trip For You`);
        response_body.price       = '999';

        log.info(`Custom Tour : ${req.savedRequestId} : ${JSON.stringify(response_body)}`);

        return res.send({
            status: true,
            statusText: 'Successful',
            data: response_body
        })

    });



/**
 * 
 */
app.get('/get-all-custom-tour-requests', getAllCustomTourRequests );
    


module.exports = app;