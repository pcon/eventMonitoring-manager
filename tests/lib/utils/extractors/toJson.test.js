beforeEach(function () {
    jest.restoreAllMocks();
});

afterEach(function () {
    jest.clearAllMocks();
});

const extractor = require('../../../../lib/utils/extractors/toJson');

describe('CSV to JSON Extractor', function () {
    test('Valid CSV data', function () {
        expect.assertions(1);

        const data = '"field1", "field2"\n"foo1", "bar1"\n"foo2", "bar2"';
        const line1 = {
            field1: 'foo1',
            field2: 'bar1'
        };
        const line2 = {
            field1: 'foo2',
            field2: 'bar2'
        };
        const expected = [line1, line2];

        return extractor(undefined, data).then(function (results) {
            expect(results).toEqual(expected);
        });
    });

    test('Empty CSV data', function () {
        expect.assertions(1);

        const data = '';
        const expected = [];

        return extractor(undefined, data).then(function (results) {
            expect(results).toEqual(expected);
        });
    });

    test('Inalid CSV data', function () {
        expect.assertions(1);

        const data = '"field1", "field2"\n"foo1", "bar1"\n"foo2", "bar2';

        return extractor(undefined, data).catch(function (err) {
            expect(err.message).toContain('unclosed_quote');
        });
    });
});