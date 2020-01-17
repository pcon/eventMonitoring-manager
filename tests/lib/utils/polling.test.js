beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();
    global.config = {};
});

afterEach(function () {
    jest.clearAllMocks();
});

const polling = require('../../../lib/utils/polling');

test('Get Job Name', function () {
    const type = 'API';
    const expected = 'Polling - API';

    expect(polling.getJobName(type)).toBe(expected);
});

test('Get Query Fields', function () {
    const expected = 'Id,CreatedDate,EventType,LogDate,LogFile,LogFileLength,LogFileContentType,LogFileFieldNames,LogFileFieldTypes';

    expect(polling.__getQueryFields()).toBe(expected);
});

describe('Get Where Condition', function () {
    test('Interval not set', function () {
        const type = 'API';
        const expected = 'EventType = \'API\' AND Interval = \'Hourly\'';

        expect(polling.__getWhereCondition(type)).toBe(expected);
    });

    test('Interval set', function () {
        global.config = {
            sfdc: {
                interval: 'TestValue'
            }
        };

        const type = 'API';
        const expected = 'EventType = \'API\' AND Interval = \'TestValue\'';

        expect(polling.__getWhereCondition(type)).toBe(expected);
    });
});

test('Get Query String', function () {
    const type = 'API';
    const expected = 'select Id,CreatedDate,EventType,LogDate,LogFile,LogFileLength,LogFileContentType,LogFileFieldNames,LogFileFieldTypes from EventLogFile where EventType = \'API\' AND Interval = \'Hourly\'';

    expect(polling.__getQueryString(type)).toBe(expected);
});

describe('Handle Log', function () {
    test('Success', function () {
        /*
        jest.mock('../../../lib/utils/sfdc', function () {
            return {
                fetchLogData: jest.fn().mockImplementation(function () {
                    return new Promise(function (resolve) {
                        resolve('FIELD1,FIELD2,FIELD3\nrow1,1,true\nrow2,2,false');
                    });
                })
            };
        });

        const log_file = {};

        const polling = require('../../../lib/utils/polling'); // eslint-disable-line global-require
        return polling.__handleLog(log_file).then(function (data) {
            expect(data).toMatch({});
        });
        */
    });

    test('Failure', function () {

    });
});