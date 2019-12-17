const consts = require('../consts');
const mongo = require('./mongo');
const sfdc = require('./sfdc');

/**
 * Gets the job name for a given topic
 * @param {String} topic The topic name
 * @return {String} The job
 */
function getJobName(topic) {
    return consts.streaming.job_name + ' - ' + topic;
}

/**
 * Handles the data and transforms / loads it where it's suppose to go
 * @param {String} topic The topic
 * @param {Object} job The job
 * @param {Object} data The data from the topic
 * @returns {void}
 */
function handleData(topic, job, data) {
    return new Promise(function (resolve, reject) {
        if (!data.payload) {
            reject(new Error('No payload sent'));
        }

        if (data.payload.EventIdentifier) {
            data.payload._id = data.payload.EventIdentifier;
        }

        var handler = mongo.insert(global.config.monitoring.db_name, topic, data.payload);

        handler.then(function () {
            job.touch();
            resolve();
        }).catch(function (err) {
            job.fail(err);
            reject(err);
        });
    });
}

/**
 * Subscribes to the topic and handles the data
 * @param {String} topic The topic name
 * @param {Integer} replay_id The replay id
 * @param {Object} job The current job
 * @returns {void}
 */
function handleSubscription(topic, replay_id, job) {
    const fayeClient = sfdc.getFayeClient(topic, replay_id);
    fayeClient.subscribe(sfdc.getChannel(topic), function (data) {
        handleData(topic, job, data);
    });
}

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
            handleSubscription(topic, replay_id, job);

            // We want to hold this open forever unless we're in a test
            if (process.env.NODE_ENV === 'test') {
                resolve();
            }
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

module.exports = {
    __subscribe: subscribe,
    __handleSubscription: handleSubscription,
    __handleData: handleData,
    getJobName: getJobName,
    handle_stream: handle_stream
};