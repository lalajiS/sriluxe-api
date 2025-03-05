const app = require('express')();
const { log } = require('../utils/logger');

const why_choose_sl = require("../data/why-choose-sl.json");
const popular_destinations = require("../data/popular-destinations.json");
const tour_packages = require("../data/tour-packages.json");
const trending_tours = require("../data/trending-tours.json");
const testimonials = require("../data/testimonials.json");



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
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: popular_destinations
        })
    });



/**
 * 
 */
app.get('/tour-packages',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: tour_packages
        })
    });



/**
 * 
 */
app.get('/trending-tours',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: trending_tours
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