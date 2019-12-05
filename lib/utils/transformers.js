const lodash = require('lodash');

const helpers = require('./helpers');

/** Map of data types to their converter */
const type_to_func = {
    String: helpers.noop,
    Id: helpers.noop,
    Number: lodash.toNumber,
    EscapedText: helpers.noop,
    DateTime: helpers.toDate,
    Error: helpers.error
};

/** Handler for unknown data type */
const unknown_type_func = helpers.noop;

/**
 * Maps the all string data to the correct types
 * @param {Object} event_log_file The event log file
 * @param {Object[]} events The data
 * @returns {Promise} A promise for when the data has been transformed
 */
function typeMap(event_log_file, events) {
    return new Promise(function (resolve, reject) {
        try {
            var func_map = {};

            const field_names = lodash.split(event_log_file.LogFileFieldNames, ',');
            const field_types = lodash.split(event_log_file.LogFileFieldTypes, ',');

            for (var i = 0; i < field_names.length; i += 1) {
                func_map[field_names[i]] = lodash.has(type_to_func, field_types[i]) ? type_to_func[field_types[i]] : unknown_type_func;
            }

            events.forEach(function (event) {
                lodash.forEach(event, function (value, key) {
                    event[key] = lodash.has(func_map, key) ? func_map[key](value) : unknown_type_func(value);
                });
            });

            resolve(events);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    typeMap: typeMap
};