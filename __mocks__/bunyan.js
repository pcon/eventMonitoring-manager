const bunyan = jest.genMockFromModule('bunyan');
jest.mock('bunyan');

const mockBunyanLogger = {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn()
};

bunyan.createLogger.mockImplementation(function () {
    return mockBunyanLogger;
});

module.exports = bunyan;