const consts = require('../consts');

/**
 * Gets the job name for a given topic
 * @param {String} topic The topic name
 * @return {String} The job
 */
function getJobName(topic) {
    return consts.streaming.job_name + ' - ' + topic;
}

module.exports = {
    getJobName: getJobName
};