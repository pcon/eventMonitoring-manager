var lodash = require('lodash');
var MongoClient = require('mongodb').MongoClient;

const consts = require('../consts');

/** Map of database names to database instances */
var db_map = {};

/**
 * Gets the database connection string
 * @param {String} db_server The server connect string
 * @param {String} db_name The database name to use
 * @param {Object} opts The connection options
 * @returns {String} The database connection string
 */
function getDatabaseString(db_server, db_name, opts) {
    var base = db_server;

    if (!base.endsWith('/')) {
        base += '/';
    }

    base += db_name;

    if (!opts) {
        return base;
    }

    var all_opts = [];
    lodash.forEach(opts, function (value, key) {
        all_opts.push(key + '=' + lodash.toString(value));
    });
    return base + '?' + lodash.join(all_opts, '&');
}

/** The connection options for agenda */
const AGENDA_OPTS = {
    retryWrites: true,
    w: 'majority'
};

const agenda_server = lodash.get(global, 'config.agenda.server') ? global.config.agenda.server : consts.DEFAULTS.agenda.server;
const agenda_db_name = lodash.get(global, 'config.agenda.db_name') ? global.config.agenda.db_name : consts.DEFAULTS.agenda.db_name;
const agenda_collection_name = lodash.get(global, 'config.agenda.collection_name') ? global.config.agenda.collection_name : consts.DEFAULTS.agenda.collection_name;

/** The default agenda configuration */
const agenda_config = {
    address: getDatabaseString(agenda_server, agenda_db_name, AGENDA_OPTS),
    collection: agenda_collection_name,
    processEvery: '1 minute',
    maxConcurrency: 30,
    defaultConcurrency: 10
};

/**
 * Inserts data into the database (and creates the collection if it does not exist)
 * @param {Object} db The mongodb instance
 * @param {String} collection_name The collection name
 * @param {Object} data The data to insert
 * @param {Function} resolve The callback for resolve
 * @param {Function} reject The callback for reject
 * @returns {void}
 */
function insert_data(db, collection_name, data, resolve, reject) {
    db.collection(collection_name).insertOne(data, function (insert_err, result) {
        if (insert_err) {
            reject(insert_err);
        } else {
            resolve(result);
        }
    });
}

/**
 * Inserts data into the database
 * @param {String} db_server The server connect string
 * @param {String} db_name The database name
 * @param {String} collection_name The collection name
 * @param {Object} data The data to insert
 * @return {Promise} A promise for when the data is inserted
 */
function insert(db_server, db_name, collection_name, data) {
    return new Promise(function (resolve, reject) {
        if (!lodash.get(db_map, db_name)) {
            const opts = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            };

            MongoClient.connect(getDatabaseString(db_server, db_name), opts, function (err, client) {
                if (err) {
                    reject(err);
                } else {
                    var db = client.db(db_name);
                    lodash.set(db_map, db_name, db);

                    insert_data(db, collection_name, data, resolve, reject);
                }
            });
        } else {
            var db = lodash.get(db_map, db_name);

            insert_data(db, collection_name, data, resolve, reject);
        }
    });
}

/**
 * Sets the database map.  Only used in tests
 * @param {Object} new_map The new database map
 * @returns {void}
 */
function updateDBMap(new_map) {
    db_map = new_map;
}

module.exports = {
    __updateDBMap: updateDBMap,
    __getDatabaseString: getDatabaseString,
    __insert_data: insert_data,
    agenda_config: agenda_config,
    insert: insert
};