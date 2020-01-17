module.exports = {
    app: {
        name: 'Event Monitoring',
        config: 'config.json'
    },
    polling: {
        field_names: [
            'Id',
            'CreatedDate',
            'EventType',
            'LogDate',
            'LogFile',
            'LogFileLength',
            'LogFileContentType',
            'LogFileFieldNames',
            'LogFileFieldTypes'
        ],
        job_name: 'Polling',
        types: [
            /*'API',
            'ApexCallout',
            'ApexExecution',
            'ApexRestAPI',
            'ApexSoap',
            'ApexTrigger',
            'ApexUnexpectedException',
            'AsyncReportRun',
            'BulkAPI',
            'ChangesetOperation',
            'Console',
            'ContentDistribution',
            'ContentDocument',
            'ContentTransfer',
            'ContinuationCalloutSummary',
            'Dashboard',
            'DocumentAttach',
            'ExternalCrossorgCallout',
            'ExternalCustomApexCallout',
            'ExternaloDataCallout',
            'InsecureExternalAssets',
            'KnowledgeArticleView',
            'LightningError',
            'LightningInteraction',
            'LightningPageView',
            'LightningPerformance',
            */
            'Login',
            /*
            'LoginAs',
            'Logout',
            'MetadataAPI',
            'Multiblock',
            'PackageInstall',
            'PlatformEncryption',
            'QueuedExec',
            'Report',
            'ReportExport',
            'RestAPI',
            'Sandbox',
            'Search',
            'SearchClick',
            'Sites',
            'TimebasedWorkflow',
            'Transaction',
            'URI',
            'VisualforceRequest',
            'WaveChange',
            'WaveInteraction',*/
            'WavePerformance'
        ]
    },
    sfdc: {
        login_url: {
            prod: 'https://login.salesforce.com',
            sandbox: 'https://test.salesforce.com'
        },
        client_name: 'eventMonitoringManager',
        auth: {
            userpass: 'userpass'
        }
    },
    streaming: {
        job_name: 'Streaming',
        topics: [
            /*'ApiEventStream',
            'LightningUriEventStream',
            'ListViewEventStream',
            'LoginAsEventStream',
            'LoginEventStream',
            'LogoutEventStream',
            'ReportEventStream',
            'UriEventStream'*/
        ]
    },
    DEFAULTS: {
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
    }
};