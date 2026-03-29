const app = require('express')();
const { log } = require('../utils/logger');

const popular_destinations  = require("../data/popular-destinations.json");
const why_choose_sl         = require("../data/why-choose-sl.json");
const testimonials          = require("../data/testimonials.json");

const { getAllPredefinedTours } = require('../utils/db'); 

/**
 * 
 */
app.get('/why-choose-sl',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: why_choose_sl
        })

    });



/**
 * 
 */
app.get('/popular-destinations',
    // secure_prod,
    // auth_credentials,
    async (req, res) => {

        let response_body = popular_destinations;

        return res.send({
            status: true,
            statusText: 'Successful',
            data: response_body
        })
    });



/**
 * 
 */
app.get('/popular-destination/:id',
    // secure_prod,
    // auth_credentials,
    async (req, res) => {

        let response_body = popular_destinations.find(tour => tour.id === req.params.id);;

        return res.send({
            status: true,
            statusText: 'Successful',
            data: response_body
        })
    });



/**
 * 
 */
app.get('/tour-packages',
    // secure_prod,
    // auth_credentials,
    getAllPredefinedTours,
    async (req, res) => {

        let response_body = await req.predefined_tours.filter(tour => tour.tour_packages === 'TRUE');

        return res.send({
            status: true,
            statusText: 'Successful',
            data: response_body
        })
    });



/**
 * 
 */
app.get('/trending-tours',
    // secure_prod,
    // auth_credentials,
    getAllPredefinedTours,
    async (req, res) => {

        let response_body = await req.predefined_tours.filter(tour => tour.trending_tour === 'TRUE');

        return res.send({
            status: true,
            statusText: 'Successful',
            data: response_body
        })
    });



/**
 * 
 */
app.get('/testimonials',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: testimonials
        })
    });




    
module.exports = app;