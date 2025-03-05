const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
var appRoot = require('app-root-path');
const { version, deployed } = require('../version.json');


/**
 * @desc  logging function, create logger file monthly and append logs
 */
var createLog = createLogger({

    // logging format
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => (
            `[${info.timestamp}] v${version}(${deployed})  ${info.level}  : ${info.message} `
        ))),

    transports: [
        new transports.DailyRotateFile({
            datePattern: 'yyyy-MM-DD',  // date pattern to change the log file name by month; creates new file monthly,
            filename: `${appRoot}/logs/api_log`,
            json: false,
            prepend: true,
            handleExceptions: true,
            exitOnError: false
        }),
        new transports.Console({
            level: 'info',
            handleExceptions: true,
            json: true,
            colorize: true,
        })
    ]

});


/** 
 * @desc  log request time, client's IP and requested url
 * @type  middleware
 * @next
 */
var logRequest = (req, res, next) => {

    createLog.info(`from ${getIP(req)} --> ${req.method}: ${req.url}`);

    next();
}


/** 
 * @desc  log request time, client's IP and requested url and Request Body
 * @param request
 */
var logReqBody = (req) => {

    createLog.info(`from ${getIP(req)} --> ${req.method}: ${req.url} --> ${req.get("content-length")}  ${JSON.stringify(req.body)}`)
}


/**
 * @desc  return the IP address of the request sender
 * @param request 
 */
function getIP(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
}


exports.logReq = logRequest;
exports.logReqBody = logReqBody;
exports.log = createLog;