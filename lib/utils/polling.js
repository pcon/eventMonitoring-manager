const lodash = require('lodash');
const Q = require('q');

const consts = require('../consts');
const extractors = require('./extractors');
const log = require('./logger');
const sfdc = require('./sfdc');
const transformers = require('./transformers');
const loaders = require('./loaders');
const recorders = require('./recorders');

/**
 * Gets the job name for a given type
 * @param {String} type The type
 * @return {String} The job
 */
function getJobName(type) {
    return `${consts.polling.job_name} - ${type}`;
}

/**
 * Gets the fields to query
 * @returns {String} The fields
 */
function getQueryFields() {
    return lodash.join(consts.polling.field_names, ',');
}

/**
 * Gets the where conditional
 * @param {String} type The type
 * @returns {String} The where conditional
 */
function getWhereCondition(type) {
    const interval = lodash.get(global, 'config.sfdc.interval') ? global.config.sfdc.interval : consts.DEFAULTS.sfdc.interval;
    var condition_parts = [
        `EventType = '${type}'`,
        `Interval = '${interval}'`
    ];

    return lodash.join(condition_parts, ' AND ');
}

/**
 * Gets the query string to get all event logs for a given type
 * @param {String} type The event type
 * @returns {String} The query string
 */
function getQueryString(type) {
    var query_parts = [
        'select',
        getQueryFields(),
        'from EventLogFile',
        'where',
        getWhereCondition(type)
    ];

    return lodash.join(query_parts, ' ');
}

/**
 * Adds steps based on the list of steps provided
 * @param {String} step_name The human readable name of the step
 * @param {String[]} step_list The list of the steps to apply
 * @param {Object} step_source The source of the step functions
 * @param {Promise[]} steps The array of the promises to apply
 * @param {Object} event_log_file The event log file to pass
 * @returns {void}
 */
function addSteps(step_name, step_list, step_source, steps, event_log_file) {
    lodash.forEach(step_list, function (step) {
        if (lodash.has(step_source, step)) {
            steps.push(step_source[step].bind(null, event_log_file));
        } else {
            log.error(`Unable to find ${step_name} "${step}"`);
        }
    });
}

/**
 * Handles the log file and does the ETL on it's data
 * @param {Object} event_log_file The log file to handle
 * @returns {Promise} A promise for when the work is done
 */
function handleLog(event_log_file) {
    var deferred = Q.defer();
    var steps = [
        sfdc.fetchLogData
    ];

    addSteps('extractor', global.config.polling.extractors, extractors, steps, event_log_file);
    addSteps('transformer', global.config.polling.transformers, transformers, steps, event_log_file);
    addSteps('loader', global.config.polling.loaders, loaders, steps, event_log_file);

    var result = Q(event_log_file);

    try {
        steps.forEach(function (func) {
            result = result.then(func)
                .catch(function (err) {
                    throw err;
                });
        });

        result.then(function () {
            deferred.resolve(event_log_file);
        });
    } catch (err) {
        deferred.reject(err);
    }

    return deferred.promise;
}

/**
 * Filters the event log files to only the ones we still need to deal with
 * @param {Object[]} event_log_files The event log files
 * @return {Promise} A promise for the filtered log files
 */
function filterEventLogs(event_log_files) {
    return new Promise(function (resolve, reject) {
        recorders.mongodb.filter(event_log_files)
            .then(function (filtered_event_log_files) {
                resolve(filtered_event_log_files);
            }).catch(function (err) {
                reject(err);
            });
    });
}

/**
 * Handles all of the event log files
 * @param {Object[]} event_log_files The event log files
 * @returns {Promise} A promise for when all the logs have been handled
 */
function handleLogs(event_log_files) {
    return new Promise(function (resolve, reject) {
        var promises = [];

        if (lodash.isEmpty(event_log_files)) {
            resolve();
        } else {
            filterEventLogs(event_log_files).then(function (filtered_event_log_files) {
                if (lodash.isEmpty(filtered_event_log_files)) {
                    resolve();
                } else {
                    filtered_event_log_files.forEach(function (event_log_file) {
                        promises.push(handleLog(event_log_file));

                        Q.allSettled(promises)
                            .then(function (results) {
                                var errors = [];
                                var success = [];

                                results.forEach(function (result) {
                                    if (result.state !== 'fulfilled') {
                                        errors.push(new Error(result.reason));
                                    } else {
                                        success.push(result.value);
                                    }
                                });

                                if (!lodash.isEmpty(success)) {
                                    recorders.mongodb.ack(success)
                                        .then(function () {
                                            resolve();
                                        }).catch(function (err) {
                                            reject(err);
                                        });
                                } else if (!lodash.isEmpty(errors)) {
                                    reject(errors);
                                } else {
                                    resolve();
                                }
                            });
                    });
                }
            }).catch(function (err) {
                reject(err);
            });
        }
    });
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
            sfdc.conn.query(getQueryString(type))
                .then(function (event_log_files) {
                    const records = lodash.map(event_log_files.records, function (record) {
                        return lodash.omit(record, 'attributes');
                    });

                    handleLogs(records)
                        .then(function () {
                            resolve();
                        }).catch(function (err) {
                            reject(err);
                        });
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

module.exports = {
    __addSteps: addSteps,
    __getAllLogs: getAllLogs,
    __getQueryFields: getQueryFields,
    __getWhereCondition: getWhereCondition,
    __getQueryString: getQueryString,
    __handleLogs: handleLogs,
    __handleLog: handleLog,
    __filterEventLogs: filterEventLogs,
    getJobName: getJobName,
    handle_polling: handle_polling
};