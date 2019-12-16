beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
});

afterEach(function () {
    jest.clearAllMocks();
});

const REJECT_MESSAGE = 'REJECTION ERROR';

/**
 * Resolves with a clean promise
 * @returns {Promise} A promise
 */
function resolve_cleanly() {
    return new Promise(function (resolve) {
        resolve();
    });
}

/**
 * Rejects with a known message
 * @returns {Promise} A promise
 */
function rejects() {
    return new Promise(function (resolve, reject) {
        reject(REJECT_MESSAGE);
    });
}

describe('Shutdown', function () {
    test('Successful', async function () {
        jest.genMockFromModule('agenda');
        jest.mock('agenda');

        var processEvents = {};

        process.on = jest.fn((signal, cb) => {
            processEvents[signal] = cb;
        });

        process.kill = jest.fn((pid, signal) => {
            processEvents[signal]();
        });
        process.exit = jest.fn();

        const local_agenda = require('../../lib/agenda'); // eslint-disable-line global-require
        expect(local_agenda.start).toBeCalled();

        await process.kill(process.pid, 'SIGTERM');

        const expected = {
            name: {
                '$regex': 'Streaming'
            }
        };

        expect(local_agenda.cancel).toBeCalledWith(expected);
    });

    test('Unsuccessful - Cancel fails', function () {
        expect.assertions(2);
        jest.genMockFromModule('agenda');
        jest.mock('agenda');

        const local_agenda = require('../../lib/agenda'); // eslint-disable-line global-require
        expect(local_agenda.start).toBeCalled();

        local_agenda.cancel.mockImplementation(rejects);
        local_agenda.stop.mockImplementation(resolve_cleanly);

        return local_agenda.__shutdown().catch(function (err) {
            expect(err).toMatch(REJECT_MESSAGE);
        });
    });

    test('Unsuccessful - Stop fails', function () {
        expect.assertions(2);
        jest.genMockFromModule('agenda');
        jest.mock('agenda');

        const local_agenda = require('../../lib/agenda'); // eslint-disable-line global-require
        expect(local_agenda.start).toBeCalled();

        local_agenda.cancel.mockImplementation(resolve_cleanly);
        local_agenda.stop.mockImplementation(rejects);

        return local_agenda.__shutdown().catch(function (err) {
            expect(err).toMatch(REJECT_MESSAGE);
        });
    });
});

test('Graceful', async function () {
    jest.genMockFromModule('agenda');
    jest.mock('agenda');

    var processEvents = {};

    process.on = jest.fn((signal, cb) => {
        processEvents[signal] = cb;
    });

    process.kill = jest.fn((pid, signal) => {
        processEvents[signal]();
    });
    process.exit = jest.fn();

    const local_agenda = require('../../lib/agenda'); // eslint-disable-line global-require
    expect(local_agenda.start).toBeCalled();

    local_agenda.cancel.mockImplementation(resolve_cleanly);
    local_agenda.stop.mockImplementation(resolve_cleanly);

    await local_agenda.__graceful();

    const expected = {
        name: {
            '$regex': 'Streaming'
        }
    };

    expect(local_agenda.cancel).toBeCalledWith(expected);
});