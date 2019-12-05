jest.mock('agendash');

beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
    global.config = {};
});

afterEach(function () {
    jest.clearAllMocks();
});

test('Route Configured', function () {
    const jobs = require('../../../lib/routes/jobs'); // eslint-disable-line global-require
    expect(jobs.use).toHaveBeenCalled();
});