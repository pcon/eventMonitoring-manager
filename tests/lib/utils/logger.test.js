global.config = {
    server: {
        logging: {
            level: 'trace'
        }
    }
};

afterEach(function () {
    jest.clearAllMocks();
});

const logger = require('../../../lib/utils/logger');

test('Fatal', function () {
    const message = 'THIS IS A MESSAGE';

    logger.fatal(message);

    expect(logger.__log.fatal).toHaveBeenCalledTimes(1);
});

test('Error', function () {
    const message = 'THIS IS A MESSAGE';

    logger.error(message);

    expect(logger.__log.error).toHaveBeenCalledTimes(1);
    expect(logger.__log.error).toHaveBeenCalledWith(message);
});

test('Warn', function () {
    const message = 'THIS IS A MESSAGE';

    logger.warn(message);

    expect(logger.__log.warn).toHaveBeenCalledTimes(1);
    expect(logger.__log.warn).toHaveBeenCalledWith(message);
});

test('Info', function () {
    const message = 'THIS IS A MESSAGE';

    logger.info(message);

    expect(logger.__log.info).toHaveBeenCalledTimes(1);
    expect(logger.__log.info).toHaveBeenCalledWith(message);
});

test('Debug', function () {
    const message = 'THIS IS A MESSAGE';

    logger.debug(message);

    expect(logger.__log.debug).toHaveBeenCalledTimes(1);
    expect(logger.__log.debug).toHaveBeenCalledWith(message);
});

test('Trace', function () {
    const message = 'THIS IS A MESSAGE';

    logger.trace(message);

    expect(logger.__log.trace).toHaveBeenCalledTimes(1);
    expect(logger.__log.trace).toHaveBeenCalledWith(message);
});