const inquirer = require('inquirer');
const fs = require('fs');
const lodash = require('lodash');
const jsonfile = require('jsonfile');
const path = require('path');

const consts = require('../lib/consts');

const questions = [
    {
        name: 'server.port',
        message: 'What port should the server run on?',
        type: 'number',
        default: consts.DEFAULTS.server.port
    },
    {
        name: 'server.logging.logger',
        message: 'What logger should be used?',
        type: 'list',
        choices: lodash.keys(consts.loggers)
    },
    {
        name: 'server.logging.file',
        message: 'Where should the Bunyan log be stored?',
        type: 'input',
        default: consts.DEFAULTS.server.logging.file,
        /**
         * Only ask the question if we using bunyan
         * @param {Object} answers The question answers
         * @returns {void}
         */
        when: function (answers) {
            return answers.server.logging.logger === consts.loggers.bunyan;
        }
    },
    {
        name: 'agenda.db_name',
        message: 'What is the agenda database name?',
        type: 'input',
        default: consts.DEFAULTS.agenda.db_name
    },
    {
        name: 'agenda.collection_name',
        message: 'What is the agenda collection name?',
        type: 'input',
        default: consts.DEFAULTS.agenda.collection_name
    },
    {
        name: 'agenda.server',
        message: 'What is the agenda database connection URI?',
        type: 'input',
        default: consts.DEFAULTS.agenda.server
    },
    {
        name: 'monitoring.type',
        message: 'What is the database should be used to track event logs?',
        type: 'list',
        choices: lodash.keys(consts.event_storage)
    },
    {
        name: 'monitoring.db_name',
        message: 'What is the event log database name?',
        type: 'input',
        default: consts.DEFAULTS.monitoring.db_name,
        /**
         * Only ask the question if we using mongo
         * @param {Object} answers The question answers
         * @returns {void}
         */
        when: function (answers) {
            return answers.monitoring.db_name === consts.event_storage.mongo;
        }
    },
    {
        name: 'agenda.server',
        message: 'What is the event log database connection URI?',
        type: 'input',
        default: consts.DEFAULTS.monitoring.server,
        /**
         * Only ask the question if we using mongo
         * @param {Object} answers The question answers
         * @returns {void}
         */
        when: function (answers) {
            return answers.monitoring.db_name === consts.event_storage.mongo;
        }
    },
    {
        name: 'sfdc.auth',
        message: 'What type of user authentication should we use for Salesforce?',
        type: 'list',
        choices: lodash.keys(consts.sfdc.auth)
    },
    {
        name: 'sfdc.username',
        message: 'What is the Salesforce username?',
        type: 'input',
        /**
         * Only ask the question if we using userpass
         * @param {Object} answers The question answers
         * @returns {void}
         */
        when: function (answers) {
            return answers.sfdc.auth === consts.sfdc.auth.userpass;
        }
    },
    {
        name: 'sfdc.password',
        message: 'What is the Salesforce password?',
        type: 'password',
        /**
         * Only ask the question if we using userpass
         * @param {Object} answers The question answers
         * @returns {void}
         */
        when: function (answers) {
            return answers.sfdc.auth === consts.sfdc.auth.userpass;
        }
    },
    {
        name: 'sfdc.sandbox',
        message: 'What type of instance is this?',
        type: 'list',
        choices: [
            'Production',
            'Sandbox'
        ],
        /**
         * Convert to a boolean
         * @param {String} value The value
         * @returns {Boolean} If it's a sandbox
         */
        filter: function (value) {
            return value === 'Sandbox';
        }
    },
    {
        name: 'sfdc.interval',
        message: 'Which frequency should be pulling logs down?',
        type: 'list',
        choices: [
            'Hourly',
            'Daily'
        ]
    },
    {
        name: 'sfdc.api',
        message: 'What API version should we use?',
        type: 'input',
        default: consts.DEFAULTS.sfdc.api,
        /**
         * Checks to make sure a valid API version
         * @param {String} value The value
         * @returns {String|Boolean} The error message or if it's valid
         */
        validate: function (value) {
            var num_value = parseInt(value, 10);

            if (Number.isNaN(num_value)) {
                return 'Invalid API version';
            }

            if (num_value < 33) {
                return 'API version should greater than or equal to 33';
            }

            return true;
        },
        /**
         * Convert to valid API format
         * @param {String} value The value
         * @returns {String} Valid API format
         */
        filter: function (value) {
            var num_value = parseInt(value, 10);
            return num_value.toString(10) + '.0';
        }
    }
];

var config_path = path.join(process.cwd(), 'config.json');

fs.access(config_path, fs.F_OK, function (read_err) {
    if (!read_err) {
        console.error(`Config file '${config_path}' already exists.`);
    } else {
        inquirer.prompt(questions).then(function (answers) {
            jsonfile.writeFile(config_path, answers, function (write_err) {
                if (write_err) {
                    console.error(write_err);
                } else {
                    console.info(`Config written to '${config_path}'`);
                }
            });
        });
    }
});