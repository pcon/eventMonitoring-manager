const bunyan = require('bunyan');

const consts = require('../consts');

var log_level = 'error';
var path = process.stdout;

try {
    log_level = global.config.server.logging.level;
} catch (err) {
    // Just eat the error
}

try {
    path = global.config.server.logging.file;
} catch (err) {
    // Just eat the error
}

var log = bunyan.createLogger({
    name: consts.app.name,
    streams: [{
        level: log_level,
        path: path
    }]
});

module.exports = {
    __log: log,
    fatal: log.fatal.bind(log),
    error: log.error.bind(log),
    warn: log.warn.bind(log),
    info: log.info.bind(log),
    debug: log.debug.bind(log),
    trace: log.trace.bind(log)
};