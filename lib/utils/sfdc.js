var jsforce = require('jsforce');
var lodash = require('lodash');
var request = require('request-promise-native');
var Q = require('q');

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
 * Fetches the log record and raw CSV data
 * @param {Object} log_record The log record
 * @returns {Promise} A promise for the raw log data
 */
function fetchLogData(log_record) {
    const request_url = new URL(log_record.LogFile, conn.instanceUrl);

    var opts = {
        url: request_url.toString(),
        headers: {
            Authorization: 'Bearer ' + conn.accessToken
        }
    };

    return request.get(opts);
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
    login: login
};