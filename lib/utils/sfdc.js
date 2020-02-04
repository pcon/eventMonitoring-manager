const jsforce = require('jsforce');
const lodash = require('lodash');
const request = require('request');
const request_promise = require('request-promise-native');
const Q = require('q');
const fs = require('fs');

const consts = require('../consts');

/**
 * Gets the login url to use
 * @param {Boolean} isSandbox Are we connecting to a sandbox
 * @returns {String} The login url
 */
function getLoginUrl(isSandbox) {
    return isSandbox ? consts.sfdc.login_url.sandbox : consts.sfdc.login_url.prod;
}

const config_sandbox = lodash.get(global, 'config.sfdc.sandbox') ? global.config.sfdc.sandbox : consts.DEFAULTS.sfdc.sandbox;
const config_api = lodash.get(global, 'config.sfdc.api') ? global.config.sfdc.api : consts.DEFAULTS.sfdc.api;

/** The salesforce connection options */
var conn_opts = {
    loginUrl: getLoginUrl(config_sandbox),
    version: config_api,
    callOptions: {
        client: consts.sfdc.client_name
    }
};

/** The global connection */
var conn = new jsforce.Connection(conn_opts);

/**
 * Auths using username and password
 * @param {Function} resolve The resolve function
 * @param {Function} reject The reject function
 * @returns {void}
 */
function auth_userpass(resolve, reject) {
    conn.login(global.config.sfdc.username, global.config.sfdc.password, function (err) {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
}

/**
 * The login function
 * @returns {Promise} A promise for when the login has completed
 */
function login() {
    var deferred = Q.defer();

    if (global.config.sfdc.auth === consts.sfdc.auth.userpass) {
        auth_userpass(deferred.resolve, deferred.reject);
    } else {
        deferred.reject(new Error(`Unknown auth mechanism '${global.config.sfdc.auth}'`));
    }

    return deferred.promise;
}

/**
 * Gets the log url
 * @param {Object} log_record The log record
 * @returns {String} The request url
 */
function getLogUrl(log_record) {
    const request_url = new URL(log_record.LogFile, conn.instanceUrl);

    return request_url.toString();
}

/**
 * Gets the request options
 * @param {Object} log_record The log record
 * @return {Object} The request options
 */
function getRequestOpts(log_record) {
    const request_url = getLogUrl(log_record);

    return {
        url: request_url,
        headers: {
            Authorization: 'Bearer ' + conn.accessToken
        }
    };
}

/**
 * Fetches the log record and raw CSV data
 * @param {Object} log_record The log record
 * @returns {Promise} A promise for the raw log data
 */
function fetchLogData(log_record) {
    return request_promise.get(getRequestOpts(log_record));
}

/**
 * Writes the log file to disk
 * @param {Object} log_record The log record
 * @param {String} filename The filename to write to
 * @returns {Promise} A promise for when the file is written
 */
function writeLogData(log_record, filename) {
    return new Promise(function (resolve, reject) {
        request.get(getRequestOpts(log_record))
            .pipe(fs.createWriteStream(filename))
            .on('error', function (err) {
                reject(err);
            }).on('finish', function () {
                resolve();
            });
    });
}

/**
 * Gets the event channel
 * @param {String} topic The event topic name
 * @returns {String} The event channel
 */
function getChannel(topic) {
    return '/event/' + topic;
}

/**
 * What to do if we have an authentication failure
 * @returns {void}
 */
function authFailure() {
    process.exit(1);
}

/**
 * Gets a faye client to use
 * @param {String} topic The event topic name
 * @param {Integer} replay_id The replay id
 * @return {Object} The faye client
 */
function getFayeClient(topic, replay_id) {
    const channel = getChannel(topic);

    const fayeClient = conn.streaming.createClient([
        new jsforce.StreamingExtension.Replay(channel, replay_id),
        new jsforce.StreamingExtension.AuthFailure(authFailure)
    ]);

    return fayeClient;
}

/**
 * Sets the new connection.  Only used in tests
 * @param {Object} newConn The new connection
 * @returns {void}
 */
function setConnection(newConn) {
    if (process.env.NODE_ENV === 'test') {
        conn = newConn;
        module.exports.conn = conn;
    } else {
        throw new Error('Should only be used in tests');
    }
}

module.exports = {
    __authFailure: authFailure,
    __auth_userpass: auth_userpass,
    __getLoginUrl: getLoginUrl,
    __setConnection: setConnection,
    __conn_opts: conn_opts,
    conn: conn,
    getChannel: getChannel,
    getFayeClient: getFayeClient,
    fetchLogData: fetchLogData,
    writeLogData: writeLogData,
    login: login
};