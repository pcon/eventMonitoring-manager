const consts = require('../consts');
const mongo = require('../utils/mongo');
const streaming = require('../utils/streaming');
const sfdc = require('../utils/sfdc');

/**
 * Subscribes to a topic and handles the data stream
 * @param {Object} job The agenda job
 * @returns {Promise} A promise for when the subscription is complete
 */
function subscribe(job) {
    return new Promise(function (resolve, reject) {
        const topic = job.attrs.data.topic;
        const replay_id = -1;

        sfdc.login().then(function () {
            const fayeClient = sfdc.getFayeClient(topic, replay_id);
            fayeClient.subscribe(sfdc.getChannel(topic), function (data) {
                if (!data.payload) {
                    return;
                }

                if (data.payload.EventIdentifier) {
                    data.payload._id = data.payload.EventIdentifier;
                }

                mongo.insert(global.config.monitoring.db_name, topic, data.payload)
                    .then(function () {
                        job.touch();
                    }).catch(function (err) {
                        job.fail(err);
                    });
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
async function handle_stream(job) {
    await subscribe(job);
}

/**
 * Streams realtime event monitoring events
 * @param {Object} agenda Our agenda instance
 * @returns {void}
 */
function handler(agenda) {
    consts.streaming.topics.forEach(function (topic) {
        agenda.define(streaming.getJobName(topic), {}, handle_stream);
    });
}

module.exports = handler;