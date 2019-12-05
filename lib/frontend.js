const express = require('express');

const jobs = require('./routes/jobs');
const log = require('./utils/logger');

/**
 * Starts the web frontend
 * @returns {void}
 */
function start() {
    var app = express();

    app.use('/jobs', jobs);

    app.listen(global.config.server.port, function () {
        log.info('Listening on ' + global.config.server.port);
    });
}

module.exports = {
    start: start
};