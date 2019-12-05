const csvtojson = require('csvtojson');

/**
 * Converts CSV data to JSON
 * @param {String} data The data from the log file request
 * @returns {Promise} A promise for when the data has been converted to CSV
 */
function csvToJsonExtractor(data) {
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

module.exports = {
    cvsToJson: csvToJsonExtractor
};