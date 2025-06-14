var express = require('express');
var cors = require('cors');
var https = require('http');
var bodyParser = require('body-parser');
var morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const logger = require('./utils/logger');

const { log } = require('./utils/logger');
const db = require('./utils/db');

require("dotenv").config();

// Set the CORS Configurations
var app = express();
app.use(cors());

// to serve static files [html]
app.use(express.static('public'));
// make the folder publicly available to access images
app.use('/public/storage', express.static('public/storage'));

// middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// log requests
app.use(morgan(`:remote-addr :method :url HTTP/:http-version :status req: :req[content-length] res: :res[content-length] :user-agent :response-time ms`, {
    stream: {
        write: (message) => {
            log.info(message.trim());
        }
    }
}));



// body parser error catcher
app.use((err, req, res, next) => {
    if (err) {
        log.warn(`(T001) BAD req 400 :: ${req.protocol}://${req.headers.host}/${req.originalUrl} :: ${JSON.stringify(req.body)}`);

        res.status(400).send({
            status: false,
            statusText: 'Bad Request (T001)'
        })
    } else {
        next()
    }
})



// Import routers
var downloadlogs = require('./routes/download_logs');
var home_page = require('./routes/home_page');
var contact = require('./routes/contact');
var tours = require('./routes/tours');
var blogs = require('./routes/blog');



// Set routers
app.use('/getlogs', downloadlogs);
app.use('/homepage', home_page);
app.use('/contact', contact);
app.use('/tours', tours);
app.use('/blog', blogs);



// invalid route requests
app.use((req, res) => {
    log.warn(`(T002) NOT found 404 :: ${req.protocol}://${req.headers.host}/${req.originalUrl} :: ${JSON.stringify(req.body)}`);

    res.status(404).send({
        status: false,
        statusText: 'Not Found (T002)'
    })
})



// create and run the server
var server = https.Server(app);
const port = process.env.PORT || 3003;
server.listen(port, function () {
    console.log(process.env.TEST_ENV_VAR);
    logger.log.info(`# SRILUXE Server API is running on Port : ${port}`);
});
