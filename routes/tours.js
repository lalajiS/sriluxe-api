const app = require('express')();
const { log } = require('../utils/logger');
const { 
    saveCustomTourRequest,
    saveTourEnquiryRequest,
    getAllCustomTourRequests,
    getAllTourEnquiryRequests } = require('../utils/db');
const { 
    tourDays,
    generateItinerary,
    getRelatedToursByDays,
    add_destination_img_to_itinerary } = require('../utils/tours');
const { 
    get_images_by_location } = require('../utils/images');
const { 
    AI_tour_description } = require('../utils/ai');
const { sendEmail } = require('../utils/email');

const custom_tour_responsebody = require("../data/custom_tour_responsebody.json");
const predefined_tours = require("../data/predefined_tours.json");



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

        response_body.price       = 'void';
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

        let related_tours = await getRelatedToursByDays(tour_days);

        return res.send({
            status: true,
            statusText: 'Successful',
            data: response_body,
            realtedTours: related_tours
        })

    });



/**
 * 
 */
app.post('/tour-enquiry',
    saveTourEnquiryRequest,
    async (req, res) => {

        let user_details     = req.body;
        let tour_details     = predefined_tours.find(tour => tour.id === req.body.tour_id);

        // notify the officials of this enqiry
        await sendEmail('New Tour Inquiry', `User : <pre> ${JSON.stringify(user_details, undefined, 2)}</pre> <br/><br/> Tour : <pre> ${JSON.stringify(tour_details, undefined, 2)}</pre>` );

        return res.send({
            status: true,
            statusText: 'Successful'
        })

    });





/**
 * 
 */
app.get('/get-all-custom-tour-requests', getAllCustomTourRequests );
app.get('/get-all-tour-enquiry-requests', getAllTourEnquiryRequests );




/**
 * 
 */
app.get([ '/tour-details/:id',
          '/popular-destinations/:id',
          '/tour-packages/:id',
          '/trending-tours/:id'],
            async (req, res) => {

            let response_body = predefined_tours.find(tour => tour.id === req.params.id);
            response_body.itenerary = await add_destination_img_to_itinerary(response_body.itenerary)
            let related_tours = await getRelatedToursByDays(response_body.num_of_days);

            log.info(`Tour details: ${req.path} / ${req.params.id} : ${JSON.stringify(response_body)}`);

            return res.send({
                status: true,
                statusText: 'Successful',
                data: response_body,
                realtedTours: related_tours
            })

    });


module.exports = app;