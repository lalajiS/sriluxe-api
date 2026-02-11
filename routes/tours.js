const app = require('express')();
const { log } = require('../utils/logger');
const {
    saveCustomTourRequest,
    saveTourEnquiryRequest,
    getAllCustomTourRequests,
    getAllTourEnquiryRequests,
    getAllGeneratedCustomTours,
    saveGeneratedCustomTour,
    getFullCustomTourData
} = require('../utils/db'); 
const {
    getRelatedToursByDays,
    add_destination_img_to_itinerary,
    generateCustomTour } = require('../utils/tours');
const { sendEmail,
        jsonToHtmlTable,
        renderCustomTourHtml,
        deepJsonToHtmlTable } = require('../utils/email');

const predefined_tours = require("../data/predefined_tours.json");



/**
 * 
 */
app.post('/custom-tour',
    saveCustomTourRequest,
    generateCustomTour,
    saveGeneratedCustomTour,
    async (req, res) => {

        req.body.custom_tour.custom_tour_id = req.savedGeneratedTourId;

        return res.send({
            status: true,
            statusText: 'Successful',
            data: req.body.custom_tour,
            realtedTours: req.body.related_tours
        })

    });



/**
 * 
 */
app.post('/custom-tour-enquiry',
    getFullCustomTourData,
    async (req, res) => {

        req.tour_data.custom_tour_request.starting_date = convertToUSDateFormat(req.tour_data.custom_tour_request.starting_date);
        req.tour_data.custom_tour_request.ending_date = convertToUSDateFormat(req.tour_data.custom_tour_request.ending_date);
        req.tour_data.custom_tour_request.phone = (`${req.tour_data.custom_tour_request.phone_code} ${req.tour_data.custom_tour_request.phone_number}`);
        
        delete req.tour_data.custom_tour_request.phone_code;
        delete req.tour_data.custom_tour_request.phone_number;
        
        // notify the officials of this enqiry
        await sendEmail('Custom Tour Inquiry', renderCustomTourHtml(req.tour_data));

        return res.send({
            status: true,
            statusText: 'Successful',
            data: req.tour_data
        })

    });



/**
 * 
 */
app.post('/tour-enquiry',
    saveTourEnquiryRequest,
    async (req, res) => {

        let user_details = req.body;
        let tour_details = predefined_tours.find(tour => tour.id === req.body.tour_id);

        let plot_data = {
            name: user_details.name,
            email: user_details.email,
            phone: (`${user_details.phone_code} ${user_details.phone_number}`),
            country: user_details.country,
            starting_date: convertToUSDateFormat(user_details.starting_date),
            ending_date: convertToUSDateFormat(user_details.ending_date),
            group: user_details.group_type,
            tour_title: tour_details.title,
        }

        // notify the officials of this enqiry
        await sendEmail('New Tour Inquiry', jsonToHtmlTable(plot_data));

        return res.send({
            status: true,
            statusText: 'Successful'
        })

    });





/**
 * 
 */
app.get('/get-all-custom-tour-requests', getAllCustomTourRequests);
app.get('/get-all-tour-enquiry-requests', getAllTourEnquiryRequests);
app.get('/get-all-generated-custom-tours', getAllGeneratedCustomTours);




/**
 * 
 */
app.get(['/tour-details/:id',
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






// Helper to convert DD/MM/YYYY to MM/DD/YYYY
function convertToUSDateFormat(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    return `${parts[1]}/${parts[0]}/${parts[2]}`;
}


module.exports = app;