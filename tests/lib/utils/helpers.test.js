const helpers = require('../../../lib/utils/helpers');

test('No Op', function () {
    const data = 'This should not change';
    expect(helpers.noop(data)).toBe(data);
});

test('Date', function () {
    const date_string = '2019-11-13T22:29:34.366Z';

    // NOTE: The second parameter is the "monthIndex" starting at 0 for Jan
    const expected = new Date(Date.UTC(2019, 10, 13, 22, 29, 34, 366));

    expect(helpers.toDate(date_string)).toEqual(expected);
});

test('Error', function () {
    const message = 'I AM ERROR';

    /**
     * Wrapper to test error throwing
     * @returns {void}
     */
    function error() {
        helpers.error(message);
    }

    expect(error).toThrowError(new Error(message));
});