const lodash = require('lodash');
const Q = require('q');

const consts = require('../consts');
const extrators = require('../utils/extractors');
const log = require('../utils/logger');
const polling = require('../utils/polling');
const sfdc = require('../utils/sfdc');
const transformers = require('../utils/transformers');

/**
 * Handles the log file and does the ETL on it's data
 * @param {Object} event_log_file The log file to handle
 * @returns {Promise} A promise for when the work is done
 */
function handleLog(event_log_file) {
    var deferred = Q.defer();
    var steps = [
        sfdc.fetchLogData,
        extrators.cvsToJson,
        transformers.typeMap.bind(null, event_log_file),
        function (data) {
            log.info(data);
            deferred.resolve();
        }
    ];

    var result = Q(event_log_file);

    try {
        steps.forEach(function (func) {
            result = result.then(func)
                .catch(function (err) {
                    throw err;
                });
        });
    } catch (err) {
        deferred.reject(err);
    }

    return deferred.promise;
}

/**
 * Handles all of the event log files
 * @param {Object[]} event_log_files The event log files
 * @param {Function} resolve The resolve function
 * @param {Function} reject The reject function
 * @returns {void}
 */
function handleLogs(event_log_files, resolve, reject) {
    var promises = [];

    if (lodash.isEmpty(event_log_files.records)) {
        resolve();
    } else {
        event_log_files.records.forEach(function (event_log_file) {
            promises.push(handleLog(event_log_file));

            var errors = [];
            Q.allSettled(promises)
                .then(function (results) {
                    results.forEach(function (result) {
                        if (result.state !== 'fulfilled') {
                            errors.push(new Error(result.reason));
                        }
                    });

                    if (!lodash.isEmpty(errors)) {
                        reject(errors);
                    } else {
                        resolve();
                    }
                });
        });
    }
}

/**
 * Gets all the logs for a job
 * @param {Object} job The agenda job
 * @returns {Promise} A promise for when the subscription is complete
 */
function getAllLogs(job) {
    return new Promise(function (resolve, reject) {
        const type = job.attrs.data.type;

        sfdc.login().then(function () {
            sfdc.conn.query(polling.getQueryString(type))
                .then(function (event_log_files) {
                    handleLogs(event_log_files, resolve, reject);
                }).catch(function (err) {
                    reject(err);
                });
        }).catch(function (err) {
            reject(err);
        });
    });
}

/**
 * Handles a specific stream
 * @param {Object} job The job that is running
 * @returns {void}
 */
async function handle_polling(job) {
    await getAllLogs(job);
}

/**
 * Poles for event monitoring logs
 * @param {Object} agenda Our agenda instance
 * @returns {void}
 */
function handler(agenda) {
    consts.polling.types.forEach(function (type) {
        agenda.define(polling.getJobName(type), {}, handle_polling);
    });
}

module.exports = handler;