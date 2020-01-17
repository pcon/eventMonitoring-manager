beforeEach(function () {
    jest.restoreAllMocks();
});

afterEach(function () {
    jest.clearAllMocks();
});

const transformers = require('../../../../lib/utils/transformers');

describe('Type Map', function () {
    test('Valid mapping', function () {
        expect.assertions(1);

        const event_log_file = {
            LogFileFieldNames: 'EVENT_TYPE,NUM_RESULTS,TIMESTAMP_DERIVED,UNKNOWN_HANDLER',
            LogFileFieldTypes: 'String,Number,DateTime,UnknownHandler'
        };

        const date_string = '2019-11-13T22:29:34.366Z';

        const event1 = {
            EVENT_TYPE: 'Test',
            NUM_RESULTS: '2',
            TIMESTAMP_DERIVED: date_string,
            UKNOWN_HANDLER: 'Should stay a string',
            UKNOWN_FIELD: 'Should stay a string'
        };
        const event2 = {
            EVENT_TYPE: 'Test',
            NUM_RESULTS: '123',
            TIMESTAMP_DERIVED: date_string,
            UKNOWN_HANDLER: 'Should stay a string',
            UKNOWN_FIELD: 'Should stay a string'
        };
        const events = [event1, event2];

        // NOTE: The second parameter is the "monthIndex" starting at 0 for Jan
        const expected_date = new Date(Date.UTC(2019, 10, 13, 22, 29, 34, 366));

        const expected_event1 = {
            EVENT_TYPE: 'Test',
            NUM_RESULTS: 2,
            TIMESTAMP_DERIVED: expected_date,
            UKNOWN_HANDLER: 'Should stay a string',
            UKNOWN_FIELD: 'Should stay a string'
        };
        const expected_event2 = {
            EVENT_TYPE: 'Test',
            NUM_RESULTS: 123,
            TIMESTAMP_DERIVED: expected_date,
            UKNOWN_HANDLER: 'Should stay a string',
            UKNOWN_FIELD: 'Should stay a string'
        };
        const expected_events = [expected_event1, expected_event2];

        return transformers.typeMap(event_log_file, events).then(function (results) {
            expect(results).toEqual(expected_events);
        });
    });

    test('Invalid mapping', function () {
        expect.assertions(1);

        const event_log_file = {
            LogFileFieldNames: 'EVENT_TYPE,NUM_RESULTS,TIMESTAMP_DERIVED',
            LogFileFieldTypes: 'Error,Number,DateTime'
        };

        const date_string = '2019-13-13T22:29:34.366Z';

        const event1 = {
            EVENT_TYPE: 'Test',
            NUM_RESULTS: '2',
            TIMESTAMP_DERIVED: date_string,
            UKNOWN_TYPE: 'Should stay a string'
        };
        const event2 = {
            EVENT_TYPE: 'Test',
            NUM_RESULTS: '123',
            TIMESTAMP_DERIVED: date_string,
            UKNOWN_TYPE: 'Should stay a string'
        };
        const events = [event1, event2];
        const expected_error_text = 'Test';

        return transformers.typeMap(event_log_file, events).catch(function (err) {
            expect(err.message).toEqual(expected_error_text);
        });
    });
});