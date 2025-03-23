const app = require('express')();
const { log } = require('../utils/logger');
const { filterBlogPost } = require('../utils/blog')
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



/**
 * 
 */
app.get('/post/:id',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        
        return res.send({
            status: true,
            statusText: 'Successful',
            data: filterBlogPost(req.params.id)
        })

    });

    
module.exports = app;