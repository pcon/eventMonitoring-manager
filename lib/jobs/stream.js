const consts = require('../consts');
const streaming = require('../utils/streaming');

/**
 * Streams realtime event monitoring events
 * @param {Object} agenda Our agenda instance
 * @returns {void}
 */
function handler(agenda) {
    consts.streaming.topics.forEach(function (topic) {
        agenda.define(streaming.getJobName(topic), {}, streaming.handle_stream);
    });
}

module.exports = handler;