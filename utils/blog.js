const blogs_data = require("../data/blog-posts.json");




function filterBlogPost(blog_id) {
    return blogs_data.filter(blog => blog.id.toString() === blog_id.toString());
}




module.exports = {
    filterBlogPost
};