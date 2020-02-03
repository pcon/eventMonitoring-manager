module.exports = {
    server: {
        port: 3000,
        logging: {
            file: '/tmp/emanger.log',
            level: 'info',
            logger: 'bunyan'
        }
    },
    agenda: {
        db_name: 'agenda',
        collection_name: 'agendaJobs',
        server: 'mongodb://localhost:27017'
    },
    monitoring: {
        type: 'mongo',
        db_name: 'monitoring',
        server: 'mongodb://localhost:27017'
    },
    sfdc: {
        auth: 'userpass',
        interval: 'Hourly',
        sandbox: false,
        api: '47.0'
    },
    polling: {
        storage_collection: {
            log_files: 'event_log_files'
        },
        extractors: [
            'toJson'
        ],
        transformers: [
            'typeMap'
        ],
        loaders: [
            'mongodb'
        ]
    }
};