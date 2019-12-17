beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation();

    global.config = {};
});

afterEach(function () {
    jest.clearAllMocks();
});

jest.mock('../lib/consts', function () {
    return {
        app: {
            name: 'Event Monitoring'
        },
        streaming: {
            job_name: 'Streaming',
            topics: [
                'a',
                'b'
            ]
        },
        polling: {
            job_name: 'Polling',
            types: [
                'c',
                'd'
            ]
        }
    };
});
jest.mock('../lib/frontend', function () {
    return {
        start: jest.fn()
    };
});

jest.mock('../lib/utils/logger');
jest.mock('../lib/utils/polling', function () {
    return {
        getJobName: jest.fn().mockImplementation(function (topic) {
            return topic;
        })
    };
});

jest.mock('../lib/utils/streaming', function () {
    return {
        getJobName: jest.fn().mockImplementation(function (topic) {
            return topic;
        })
    };
});

jest.mock('../lib/agenda', function () {
    return {
        on: jest.fn().mockImplementation(function (action, cb) {
            cb();

            return {
                on: jest.fn().mockImplementation(function (second_action, second_cb) {
                    second_cb();
                })
            };
        }),
        every: jest.fn(),
        now: jest.fn()
    };
});

describe('Start', function () {
    test('No Errors', function () {
        jest.mock('../lib/utils/config', function () {
            return {
                loadConfig: jest.fn().mockImplementation(function () {
                    return new Promise(function (resolve) {
                        resolve();
                    });
                })
            };
        });

        const config = require('../lib/utils/config'); // eslint-disable-line global-require

        require('../server'); // eslint-disable-line global-require
        expect(config.loadConfig).toBeCalled();
        expect(console.error).not.toBeCalled();
    });

    test('Errors', function () {
        jest.mock('../lib/utils/config', function () {
            return {
                loadConfig: jest.fn().mockImplementation(function () {
                    return new Promise(function (resolve, reject) {
                        reject('I AM ERROR');
                    });
                })
            };
        });

        const config = require('../lib/utils/config'); // eslint-disable-line global-require

        require('../server'); // eslint-disable-line global-require
        expect(config.loadConfig).toBeCalled();
    });
});