const lodash = require('lodash');

const log = require('../logger');
const mongo = require('../mongo');

/**
 * Logs the data to a mongo database
 * @param {Object} event_log_file The event log file
 * @param {Object[]} events The data
 * @returns {Promise} A promise for when the data has been loaded
 */
function logToMongo(event_log_file, events) {
    return new Promise(function (resolve, reject) {
        log.debug(`Got ${events.length} ${event_log_file.EventType} logs`);

        lodash.forEach(events, function (event) {
            event._id = event.EventIdentifier;
        });

        mongo.insertMany(
            global.config.monitoring.server,
            global.config.monitoring.db_name,
            event_log_file.EventType,
            events
        ).then(function () {
            log.debug(`Inserted ${events.length} ${event_log_file.EventType} logs`);
            resolve(events);
        }).catch(function (err) {
            log.error(err);
            reject(err);
        });
    });
}

module.exports = logToMongo;