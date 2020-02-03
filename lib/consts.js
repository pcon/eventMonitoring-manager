module.exports = {
    loggers: {
        bunyan: 'bunyan',
        console: 'console'
    },
    event_storage: {
        mongo: 'mongo'
    },
    app: {
        name: 'Event Monitoring',
        config: 'config.json'
    },
    polling: require('./consts/polling.js'), // eslint-disable-line global-require
    sfdc: require('./consts/sfdc.js'), // eslint-disable-line global-require
    streaming: require('./consts/streaming.js'), // eslint-disable-line global-require,
    DEFAULTS: require('./consts/defaults.js') // eslint-disable-line global-require,
};