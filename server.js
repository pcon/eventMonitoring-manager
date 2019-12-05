const config = require('./lib/utils/config');

config.loadConfig().then(function () {
    /* eslint-disable global-require */
    const consts = require('./lib/consts');
    const frontend = require('./lib/frontend');
    const log = require('./lib/utils/logger');
    const polling = require('./lib/utils/polling');
    const streaming = require('./lib/utils/streaming');
    const agenda = require('./lib/agenda');
    /* eslint-enable global-require */

    agenda.on('ready', function () {
        consts.streaming.topics.forEach(function (topic) {
            var data = {
                topic: topic
            };

            agenda.now(streaming.getJobName(topic), data);
        });

        consts.polling.types.forEach(function (type) {
            var data = {
                type: type
            };

            agenda.every('30 minutes', polling.getJobName(type), data);
        });
    }).on('error', function (err) {
        log.error(err);
    });

    frontend.start();
}).catch(function (error) {
    console.error(error);
});