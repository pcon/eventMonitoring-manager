/**
 * Throws an error.  Only used for testing
 * @param {String} data The error message
 * @returns {void}
 * @throws An error every time
 */
function error(data) {
    throw new Error(data);
}

/**
 * Does nothing
 * @param {Object} data The incoming data
 * @returns {Object} The unmodified data
 */
function noop(data) {
    return data;
}

/**
 * Parses the date into a Javascript date object
 * @param {Object} data The incoming data
 * @returns {Date} The parsed date
 */
function toDate(data) {
    return new Date(data);
}

module.exports = {
    error: error,
    noop: noop,
    toDate: toDate
};