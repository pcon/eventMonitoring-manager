const express = require('express');
const lodash = require('lodash');

const consts = require('./consts');
const jobs = require('./routes/jobs');
const log = require('./utils/logger');

/**
 * Starts the web frontend
 * @returns {void}
 */
function start() {
    var app = express();

    app.use('/jobs', jobs);

    const port = lodash.get(global, 'config.server.port') ? global.config.server.port : consts.DEFAULTS.server.port;

    app.listen(port, function () {
        log.info('Listening on ' + port);
    });
}

module.exports = {
    start: start
};