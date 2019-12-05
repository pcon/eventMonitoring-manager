beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
});

afterEach(function () {
    jest.clearAllMocks();
});

const _db = {
    collection: jest.fn()
};
const _resolve = jest.fn();
const _reject = jest.fn();

describe('Get database string', function () {
    test('No options with slash', function () {
        const db_server = 'mongodb://localhost:27017/';
        const db_name = 'testdb';
        const expected = 'mongodb://localhost:27017/testdb';

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require
        expect(mongo.__getDatabaseString(db_server, db_name)).toEqual(expected);
    });

    test('No options without slash', function () {
        const db_server = 'mongodb://localhost:27017';
        const db_name = 'testdb';
        const expected = 'mongodb://localhost:27017/testdb';

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require
        expect(mongo.__getDatabaseString(db_server, db_name)).toEqual(expected);
    });

    test('Options', function () {
        const db_server = 'mongodb://localhost:27017/';
        const db_name = 'testdb';
        const opts = {
            param1: 'foo',
            param2: 'bar'
        };
        const expected = 'mongodb://localhost:27017/testdb?param1=foo&param2=bar';

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require
        expect(mongo.__getDatabaseString(db_server, db_name, opts)).toEqual(expected);
    });
});

describe('Agenda config', function () {
    test('No global config', function () {
        const expected = {
            address: 'mongodb://localhost:27017/agenda?retryWrites=true&w=majority',
            collection: 'agendaJobs',
            processEvery: '1 minute',
            maxConcurrency: 30,
            defaultConcurrency: 10
        };

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

        expect(mongo.agenda_config).toEqual(expected);
    });

    test('Global config', function () {
        global.config = {
            agenda: {
                server: 'mongodb://mongo.example.com:1234',
                db_name: 'customAgenda',
                collection_name: 'customCollection'
            }
        };

        const expected = {
            address: 'mongodb://mongo.example.com:1234/customAgenda?retryWrites=true&w=majority',
            collection: 'customCollection',
            processEvery: '1 minute',
            maxConcurrency: 30,
            defaultConcurrency: 10
        };

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

        expect(mongo.agenda_config).toEqual(expected);
    });
});

describe('Insert Data', function () {
    test('Valid', function () {
        expect.assertions(2);
        const collection_name = 'customCollection';
        const data = {
            field1: 'foo',
            field2: 'bar'
        };

        _db.collection.mockImplementation(function () {
            return {
                insertOne: jest.fn().mockImplementation(function (d, cb) {
                    cb(undefined, d);
                })
            };
        });

        const resolve = jest.fn().mockImplementation(function (d) {
            expect(_db.collection).toBeCalledWith(collection_name);
            expect(d).toBe(data);
        });

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

        mongo.__insert_data(_db, collection_name, data, resolve, _reject);
    });

    test('Invalid', function () {
        expect.assertions(2);
        const collection_name = 'customCollection';
        const data = {
            field1: 'foo',
            field2: 'bar'
        };
        const error = 'I AM ERROR';

        _db.collection.mockImplementation(function () {
            return {
                insertOne: jest.fn().mockImplementation(function (d, cb) {
                    cb(error, undefined);
                })
            };
        });

        const reject = jest.fn().mockImplementation(function (err) {
            expect(_db.collection).toBeCalledWith(collection_name);
            expect(err).toBe(error);
        });

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

        mongo.__insert_data(_db, collection_name, data, _resolve, reject);
    });
});

describe('Insert', function () {
    test('Not mapped, no error', function () {
        expect.assertions(6);

        const MongoClient = require('mongodb').MongoClient; // eslint-disable-line global-require
        jest.mock('mongodb');

        const db_server = 'mongodb://localhost:27017/';
        const db_name = 'testdb';
        const collection_name = 'testCollection';
        const data = {
            field1: 'foo',
            field2: 'bar'
        };

        const expected_connect_string = 'mongodb://localhost:27017/testdb';
        const expected_opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        MongoClient.connect.mockImplementation(function (connect_string, opts, cb) {
            expect(connect_string).toEqual(expected_connect_string);
            expect(opts).toEqual(expected_opts);

            const client = {
                db: jest.fn().mockImplementation(function (db) {
                    expect(db).toEqual(db_name);

                    _db.collection.mockImplementation(function (collection) {
                        expect(collection).toEqual(collection_name);

                        return {
                            insertOne: jest.fn().mockImplementation(function (d, cb) {
                                expect(d).toBe(data);
                                cb(undefined, d);
                            })
                        };
                    });

                    return _db;
                })
            };
            cb(undefined, client);
        });

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require
        return mongo.insert(db_server, db_name, collection_name, data).then(function (results) {
            expect(results).toBe(data);
        });
    });

    test('Not mapped, has error', function () {
        expect.assertions(3);

        const MongoClient = require('mongodb').MongoClient; // eslint-disable-line global-require
        jest.mock('mongodb');

        const db_server = 'mongodb://localhost:27017/';
        const db_name = 'testdb';
        const collection_name = 'testCollection';
        const data = {
            field1: 'foo',
            field2: 'bar'
        };
        const error = 'I AM ERROR';

        const expected_connect_string = 'mongodb://localhost:27017/testdb';
        const expected_opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        MongoClient.connect.mockImplementation(function (connect_string, opts, cb) {
            expect(connect_string).toEqual(expected_connect_string);
            expect(opts).toEqual(expected_opts);
            cb(new Error(error), undefined);
        });

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require
        return mongo.insert(db_server, db_name, collection_name, data).catch(function (err) {
            expect(err.message).toBe(error);
        });
    });

    test('Mapped', function () {
        expect.assertions(3);

        const db_server = 'mongodb://localhost:27017/';
        const db_name = 'testdb';
        const collection_name = 'testCollection';
        const data = {
            field1: 'foo',
            field2: 'bar'
        };

        _db.collection.mockImplementation(function (collection) {
            expect(collection).toEqual(collection_name);

            return {
                insertOne: jest.fn().mockImplementation(function (d, cb) {
                    expect(d).toBe(data);
                    cb(undefined, d);
                })
            };
        });

        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require
        mongo.__updateDBMap({
            testdb: _db
        });
        return mongo.insert(db_server, db_name, collection_name, data).then(function (results) {
            expect(results).toBe(data);
        });
    });
});