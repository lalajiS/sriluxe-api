const app = require('express')();
const { log } = require('../utils/logger');

const blog_posts = require("../data/blog-posts.json");



/**
 * 
 */
app.get('/posts',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: true,
            statusText: 'Successful',
            data: blog_posts
        })

    });



    
module.exports = app;