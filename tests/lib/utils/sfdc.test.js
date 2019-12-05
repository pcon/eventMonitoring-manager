beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    global.config = {};
});

afterEach(function () {
    jest.clearAllMocks();
});

const _resolve = jest.fn();
const _reject = jest.fn();

const jsforce = require('jsforce');
var sfdc = require('../../../lib/utils/sfdc');

describe('Get Login URL', function () {
    test('Is Sandbox', function () {
        expect(sfdc.__getLoginUrl(true)).toEqual('https://test.salesforce.com');
    });

    test('Is Production', function () {
        expect(sfdc.__getLoginUrl(false)).toEqual('https://login.salesforce.com');
    });
});

test('Get channel', function () {
    const topic = 'ApiEventStream';
    const expected = '/event/ApiEventStream';

    expect(sfdc.getChannel(topic)).toEqual(expected);
});

describe('Login', function () {
    test('Username / Password', function () {
        expect.assertions(3);

        const sfdc_username = 'user@example.com';
        const sfdc_password = 'lamepassword';

        global.config = {
            sfdc: {
                username: sfdc_username,
                password: sfdc_password,
                auth: 'userpass'
            }
        };

        const conn = new jsforce.Connection({
            login: jest.fn().mockImplementation(function (username, password, cb) {
                expect(username).toEqual(sfdc_username);
                expect(password).toEqual(sfdc_password);
                cb();
            })
        });

        sfdc.__setConnection(conn);
        return sfdc.login().then(function () {
            expect(true).toBeTruthy();
        });
    });

    test('Unknown Auth', function () {
        expect.assertions(1);

        global.config = {
            sfdc: {
                auth: 'UNKNOWN'
            }
        };

        return sfdc.login().catch(function (err) {
            expect(err.message).toEqual('Unknown auth mechanism \'UNKNOWN\'');
        });
    });
});

describe('Authentication', function () {
    describe('Username / Password', function () {
        test('Valid', function () {
            expect.assertions(3);

            const sfdc_username = 'user@example.com';
            const sfdc_password = 'lamepassword';

            global.config = {
                sfdc: {
                    username: sfdc_username,
                    password: sfdc_password
                }
            };

            const conn = new jsforce.Connection({
                login: jest.fn().mockImplementation(function (username, password, cb) {
                    expect(username).toEqual(sfdc_username);
                    expect(password).toEqual(sfdc_password);
                    cb();
                })
            });

            const resolve = jest.fn().mockImplementation(function () {
                expect(resolve).toHaveBeenCalled();
            });

            sfdc.__setConnection(conn);
            sfdc.__auth_userpass(resolve, _reject);
        });

        test('Invalid', function () {
            expect.assertions(3);

            const sfdc_username = 'user@example.com';
            const sfdc_password = 'lamepassword';
            const error_message = 'I AM ERROR';

            global.config = {
                sfdc: {
                    username: sfdc_username,
                    password: sfdc_password
                }
            };

            const conn = new jsforce.Connection({
                login: jest.fn().mockImplementation(function (username, password, cb) {
                    expect(username).toEqual(sfdc_username);
                    expect(password).toEqual(sfdc_password);
                    cb(error_message);
                })
            });

            const reject = jest.fn().mockImplementation(function (err) {
                expect(err).toBe(error_message);
            });

            sfdc.__setConnection(conn);
            sfdc.__auth_userpass(_resolve, reject);
        });
    });
});

describe('Set Connection', function () {
    test('Is in test', function () {
        const conn = {
            variable: 'foo'
        };

        sfdc.__setConnection(conn);

        expect(sfdc.conn).toBe(conn);
    });

    test('Not in test', function () {
        delete process.env.NODE_ENV;
        const conn = {
            variable: 'foo'
        };

        /**
         * Wrapper to test error throwing
         * @returns {void}
         */
        function error() {
            sfdc.__setConnection(conn);
        }

        expect(error).toThrow('Should only be used in tests');
    });
});

describe('Connection Options', function () {
    test('Unset config', function () {
        const expected = {
            loginUrl: 'https://login.salesforce.com',
            version: '47.0',
            callOptions: {
                client: 'eventMonitoringManager'
            }
        };

        expect(sfdc.__conn_opts).toEqual(expected);
    });

    test('Set config', function () {
        const expected = {
            loginUrl: 'https://test.salesforce.com',
            version: '999.0',
            callOptions: {
                client: 'eventMonitoringManager'
            }
        };

        global.config = {
            sfdc: {
                sandbox: true,
                api: '999.0'
            }
        };

        jest.resetModules();
        sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

        expect(sfdc.__conn_opts).toEqual(expected);
    });
});

describe('Fetch Log Data', function () {
    test('Trailing Slash', function () {
        expect.assertions(1);

        const conn = new jsforce.Connection({
            instanceUrl: 'https://example.my.salesforce.com/',
            accessToken: '123abc'
        });

        sfdc.__setConnection(conn);

        const log_record = {
            LogFile: '/services/data/v42.0/sobjects/EventLogFile/0AT1F000007NLBZZZZ'
        };

        const expected = {
            url: 'https://example.my.salesforce.com/services/data/v42.0/sobjects/EventLogFile/0AT1F000007NLBZZZZ',
            headers: {
                Authorization: 'Bearer 123abc'
            }
        };

        return sfdc.fetchLogData(log_record).then(function (data) {
            expect(data).toStrictEqual(expected);
        });
    });

    test('No trailing Slash', function () {
        expect.assertions(1);

        const conn = new jsforce.Connection({
            instanceUrl: 'https://example.my.salesforce.com',
            accessToken: '123abc'
        });

        sfdc.__setConnection(conn);

        const log_record = {
            LogFile: '/services/data/v42.0/sobjects/EventLogFile/0AT1F000007NLBZZZZ'
        };

        const expected = {
            url: 'https://example.my.salesforce.com/services/data/v42.0/sobjects/EventLogFile/0AT1F000007NLBZZZZ',
            headers: {
                Authorization: 'Bearer 123abc'
            }
        };

        return sfdc.fetchLogData(log_record).then(function (data) {
            expect(data).toStrictEqual(expected);
        });
    });
});

test('Get Faye Client', function () {
    jest.resetModules();
    const topic = 'ApiEventStream';
    sfdc.getFayeClient(topic, -1);

    expect(sfdc.conn.streaming.createClient).toHaveBeenCalled();
});

test('Authentication Failure', function () {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(function () {});
    sfdc.__authFailure();
    expect(mockExit).toHaveBeenCalledWith(1);
});