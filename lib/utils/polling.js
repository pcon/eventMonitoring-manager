const lodash = require('lodash');

const consts = require('../consts');

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

module.exports = {
    __getQueryFields: getQueryFields,
    __getWhereCondition: getWhereCondition,
    getJobName: getJobName,
    getQueryString: getQueryString
};