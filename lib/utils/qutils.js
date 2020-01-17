const lodash = require('lodash');

/**
 * Handles all of the promises from an all settled and rejects if there are
 * any unfulfilled results
 * @param {Object[]} results The results from allSettled
 * @param {Function} resolve The resolve function
 * @param {Function} reject The reject function
 * @returns {void}
 */
function handleAllSettled(results, resolve, reject) {
    var errors = [];

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
}

module.exports = {
    handleAllSettled: handleAllSettled
};