const jsonfile = require('jsonfile');
const lodash = require('lodash');
const path = require('path');

const consts = require('../consts');

/**
 * Gets the filename to load from disk
 * @returns {String} The config filename
 */
function getConfigFilename() {
    var root = process.env.CONFIG_ROOT ? process.env.CONFIG_ROOT : '';
    return path.join(root, consts.app.config);
}

/**
 * Loads the config from disk
 * @returns {Promise} A promise for when the config is loaded
 */
function loadConfig() {
    return new Promise(function (resolve, reject) {
        jsonfile.readFile(getConfigFilename())
            .then(function (data) {
                global.config = lodash.merge(consts.DEFAULTS, data);
                resolve();
            }).catch(reject);
    });
}

/**
 * Saves the config to disk
 * @returns {Promise} A promise for when the config is saved
 */
function saveConfig() {
    return new Promise(function (resolve, reject) {
        jsonfile.writeFile(getConfigFilename(), global.config)
            .then(resolve)
            .catch(reject);
    });
}

var Configure = {
    getConfigFilename: getConfigFilename,
    loadConfig: loadConfig,
    saveConfig: saveConfig
};

module.exports = Configure;