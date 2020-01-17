const csvtojson = require('csvtojson');

/**
 * Converts CSV data to JSON
 * @param {Object} event_log_file The event log file
 * @param {String} data The data from the log file request
 * @returns {Promise} A promise for when the data has been converted to CSV
 */
function toJson(event_log_file, data) {
    return new Promise(function (resolve, reject) {
        csvtojson()
            .fromString(data)
            .then(function (data) {
                resolve(data);
            }).catch(function (err) {
                reject(err);
            });
    });
}

module.exports = toJson;