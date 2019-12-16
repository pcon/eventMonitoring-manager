const Agenda = require('agenda');
const consts = require('./consts');
const log = require('./utils/logger');
const mongo = require('./utils/mongo');

const connection_opts = {
    db: mongo.agenda_config
};

var agenda = new Agenda(connection_opts);
require('./jobs/stream')(agenda);
require('./jobs/pole')(agenda);

/**
 * Stop all running streaming jobs
 * @returns {Promise} A promise for when the streaming jobs are stopped
 */
function shutdown() {
    return new Promise(function (resolve, reject) {
        const streaming_query = {
            name: {
                '$regex': consts.streaming.job_name
            }
        };

        try {
            agenda.cancel(streaming_query)
                .then(function () {
                    agenda.stop().then(function () {
                        resolve();
                    }).catch(function (err) {
                        reject(err);
                    });
                }).catch(function (err) {
                    reject(err);
                });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Gracefully shutdown
 * @returns {void}
 */
async function graceful() {
    log.info('Gracefully shutting down');
    await shutdown();
    process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

agenda.start();

agenda.__graceful = graceful;
agenda.__shutdown = shutdown;

module.exports = agenda;