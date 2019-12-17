const consts = require('../consts');
const polling = require('../utils/polling');

/**
 * Poles for event monitoring logs
 * @param {Object} agenda Our agenda instance
 * @returns {void}
 */
function handler(agenda) {
    consts.polling.types.forEach(function (type) {
        agenda.define(polling.getJobName(type), {}, polling.handle_polling);
    });
}

module.exports = handler;