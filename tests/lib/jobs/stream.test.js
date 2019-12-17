beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
});

afterEach(function () {
    jest.clearAllMocks();
});

test('Handler', function () {
    jest.mock('../../../lib/consts', function () {
        return {
            streaming: {
                topics: [
                    'a',
                    'b'
                ]
            }
        };
    });

    jest.mock('../../../lib/utils/streaming', function () {
        return {
            getJobName: jest.fn().mockImplementation(function (topic) {
                return topic;
            }),
            handle_stream: jest.fn()
        };
    });

    const agenda = {
        define: jest.fn()
    };

    require('../../../lib/jobs/stream')(agenda); // eslint-disable-line global-require

    expect(agenda.define).toHaveBeenNthCalledWith(1, 'a', {}, expect.any(Function));
    expect(agenda.define).toHaveBeenNthCalledWith(2, 'b', {}, expect.any(Function));
});