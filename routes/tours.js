const app = require('express')();
const { log } = require('../utils/logger');
const { 
    saveCustomTourRequest,
    getAllCustomTourRequests } = require('../utils/db');
const { 
    tourDays,
    generateItinerary } = require('../utils/tours');
const { 
    AI_tour_description } = require('../utils/ai');

const custom_tour_responsebody = require("../data/custom_tour_responsebody.json");



/**
 * 
 */
app.post('/custom-tour',
    saveCustomTourRequest,
    async (req, res) => {

        let tour_days             = tourDays(req.body.starting_date, req.body.ending_date);
        let response_body         = { ...custom_tour_responsebody };
        response_body.num_of_days = tour_days;

        let ai_content            = await AI_tour_description(response_body);

        response_body.price       = '999';
        response_body.title       = ai_content.title;
        response_body.db_entry_id = req.savedRequestId;
        response_body.description = ai_content.description;
        console.log('Generating Itenerary');
        response_body.itenerary   = await generateItinerary(
                                                (req.body.starting_date),
                                                (req.body.ending_date),
                                                ('Both'),
                                                (req.body.luxury_level),
                                                (req.body.activity_level),
                                                (req.body.wildlife_focus),
                                                (req.body.cultural_depth) )

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




/**
 * 
 */
app.get([ '/tour-details/:id',
          '/why-choose-sl/:id',
          '/popular-destinations/:id',
          '/tour-packages/:id',
          '/trending-tours/:id'],
            async (req, res) => {

            let response_body = { ...custom_tour_responsebody };
            response_body.id  = req.params.id

            log.info(`Tour details: ${req.path} / ${req.params.id} : ${JSON.stringify(response_body)}`);

            return res.send({
                status: true,
                statusText: 'Successful',
                data: response_body
            })

    });


module.exports = app;