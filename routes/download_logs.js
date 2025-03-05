const app = require('express')();
const fs = require('fs');
const appRoot = require('app-root-path');
const { log } = require('../utils/logger');



/**
 * go to logs web page
 */
app.get('/',
    // secure_prod,
    (req, res) => {

        res.sendFile(`${appRoot}/public/web/download_logs/index.html`);

    });



/**
 * authenticate to get access to log files
 */
app.get('/authenticate',
    // secure_prod,
    // auth_credentials,
    (req, res) => {
        return res.send({
            status: false,
            statusText: 'Access denied'
        })

    });



/**
 * returns list of log files
 */
app.get('/listfiles',
    // secure_prod,
    // secure_access,
    (req, res) => {

        fs.readdir(`${appRoot}/logs`, (err, files) => {

            if (err) {
                log.info(`(T011) Log files read Err: ${err}`);
                res.send([]);
            }

            res.send(files);
        });

    });



/**
 * download stream the requesting log file
 * @queryParam fileName
 */
app.get('/download',
    // secure_prod,
    // secure_access,
    (req, res) => {

        // set file name with extention [.txt]
        let file_name = req.query.fileName.replace('.', '_');
        res.writeHead(200, { 'Content-Disposition': `'filename="${file_name}.txt"'` });

        // stream the file ad downloadable
        const file = `${appRoot}/logs/${req.query.fileName}`;
        let filestream = fs.createReadStream(file);
        filestream.pipe(res);

    });



module.exports = app;