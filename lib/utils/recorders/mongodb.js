const lodash = require('lodash');

const log = require('../logger');
const mongo = require('../mongo');

/**
 * Fetch the related event log files
 * @param {Object[]} event_log_files The event log files to record
 * @returns {Promise} A promise for when the event logs have been recorded
 */
function fetch(event_log_files) {
    return new Promise(function (resolve, reject) {
        const query = {
            _id: {
                '$in': lodash.map(event_log_files, 'Id')
            }
        };

        mongo.find(
            global.config.monitoring.server,
            global.config.monitoring.db_name,
            global.config.polling.storage_collection.log_files,
            query
        ).then(function (fetched_log_files) {
            resolve(fetched_log_files);
        }).catch(function (err) {
            reject(err);
        });
    });
}

/**
 * Acknowledges all of the event log files
 * @param {Object[]} event_log_files The event log files to acknowledge
 * @returns {Promise} A promise for when the event logs have been acknowledged
 */
function ack(event_log_files) {
    return new Promise(function (resolve, reject) {
        lodash.forEach(event_log_files, function (event_log_file) {
            event_log_file._id = event_log_file.Id;
        });

        mongo.insertMany(
            global.config.monitoring.server,
            global.config.monitoring.db_name,
            global.config.polling.storage_collection.log_files,
            event_log_files
        ).then(function () {
            resolve(event_log_files);
        }).catch(function (err) {
            reject(err);
        });
    });
}

/**
 * Filters out the log files and only returns the ones that have not been acknowledged
 * @param {Object[]} event_log_files The event log files to filter
 * @returns {Promise} A promise for the filtered log files
 */
function filter(event_log_files) {
    return new Promise(function (resolve, reject) {
        log.debug(`Got ${event_log_files.length} log files`);
        fetch(event_log_files)
            .then(function (fetched_log_files) {
                log.debug(`Fetched ${fetched_log_files.length} acked log files`);

                const log_map = lodash.keyBy(fetched_log_files, 'Id');
                const filtered_log_files = lodash.filter(event_log_files, function (log_file) {
                    return !lodash.has(log_map, log_file.Id);
                });

                log.debug(`Filtered down to ${filtered_log_files.length}`);

                resolve(filtered_log_files);
            }).catch(function (err) {
                reject(err);
            });
    });
}

module.exports = {
    ack: ack,
    fetch: fetch,
    filter: filter
};