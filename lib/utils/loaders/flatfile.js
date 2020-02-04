const fs = require('fs');
const path = require('path');
const moment = require('moment');

const sfdc = require('../sfdc');

/**
 * Formats a path using momentjs' format and a custom entry for log type
 *
 * https://momentjs.com/docs/#/displaying/format/
 * @param {Object} event_log_file The event log file
 * @param {String} path_format The path format
 * @returns {String} A formatted path
 */
function formatPath(event_log_file, path_format) {
    const log_date_m = moment(event_log_file.LogDate);

    return log_date_m.utc().format(path_format).replace(/t/g, event_log_file.EventType);
}

/**
 * Writes the log data to disk
 * @param {Object} event_log_file The event log file
 * @param {Object[]} events The events
 * @param {String} filename The filename
 * @param {Function} resolve The resolve function
 * @param {Function} reject The reject function
 * @returns {void}
 */
function writeLogData(event_log_file, events, filename, resolve, reject) {
    console.log(event_log_file);
    sfdc.writeLogData(event_log_file, filename)
        .then(function () {
            resolve(events);
        })
        .catch(function (write_err) {
            reject(write_err);
        });
}

/**
 * Logs the data to a disk
 * @param {Object} event_log_file The event log file
 * @param {Object[]} events The data
 * @returns {Promise} A promise for when the data has been loaded
 */
function logToFile(event_log_file, events) {
    return new Promise(function (resolve, reject) {
        const formatted_path = formatPath(event_log_file, global.config.polling.config.loaders.flatfile.directory);
        const formatted_name = formatPath(event_log_file, global.config.polling.config.loaders.flatfile.file);
        const base_path = path.join(
            global.config.polling.config.loaders.flatfile.root,
            formatted_path
        );

        const filename = path.format({
            dir: base_path,
            name: formatted_name,
            ext: `.${global.config.polling.config.loaders.flatfile.extension}`
        });

        fs.access(base_path, function (path_err) {
            if (!path_err) {
                writeLogData(event_log_file, events, filename, resolve, reject);
            } else if (path_err && path_err.code === 'ENOENT') {
                fs.mkdir(base_path, {
                    recursive: true
                }, function (mkdir_err) {
                    if (mkdir_err) {
                        reject(mkdir_err);
                    } else {
                        writeLogData(event_log_file, events, filename, resolve, reject);
                    }
                });
            } else {
                reject(path_err);
            }
        });
    });
}

module.exports = logToFile;