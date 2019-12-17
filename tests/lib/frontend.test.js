beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();

    global.config = {};
});

afterEach(function () {
    jest.clearAllMocks();
});

describe('Start', function () {
    test('Port defined', function () {
        global.config = {
            server: {
                port: 8080
            }
        };

        jest.mock('express', function () {
            return jest.fn().mockImplementation(function () {
                return {
                    use: jest.fn(),
                    listen: jest.fn().mockImplementation(function (port, cb) {
                        cb();
                    })
                };
            });
        });

        const logger = require('../../lib/utils/logger'); // eslint-disable-line global-require
        jest.mock('../../lib/utils/logger', function () {
            return {
                info: jest.fn()
            };
        });

        jest.mock('../../lib/routes/jobs', function () {
            return jest.fn();
        });
        const frontend = require('../../lib/frontend'); // eslint-disable-line global-require

        frontend.start();

        expect(logger.info).toBeCalledWith('Listening on 8080');
    });

    test('Port undefined', function () {
        jest.mock('express', function () {
            return jest.fn().mockImplementation(function () {
                return {
                    use: jest.fn(),
                    listen: jest.fn().mockImplementation(function (port, cb) {
                        cb();
                    })
                };
            });
        });

        const logger = require('../../lib/utils/logger'); // eslint-disable-line global-require
        jest.mock('../../lib/utils/logger', function () {
            return {
                info: jest.fn()
            };
        });

        jest.mock('../../lib/routes/jobs', function () {
            return jest.fn();
        });
        const frontend = require('../../lib/frontend'); // eslint-disable-line global-require

        frontend.start();

        expect(logger.info).toBeCalledWith('Listening on 3000');
    });
});