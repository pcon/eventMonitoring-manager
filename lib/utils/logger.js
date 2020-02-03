const bunyan = require('bunyan');
const lodash = require('lodash');

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

var log;

if (lodash.get(global.config, 'server.logging.logger') === consts.loggers.bunyan) {
    log = bunyan.createLogger({
        name: consts.app.name,
        streams: [{
            level: log_level,
            path: path
        }]
    });
} else {
    log = {
        fatal: console.error,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
        trace: console.trace
    };
}

module.exports = {
    __log: log,
    fatal: log.fatal.bind(log),
    error: log.error.bind(log),
    warn: log.warn.bind(log),
    info: log.info.bind(log),
    debug: log.debug.bind(log),
    trace: log.trace.bind(log)
};