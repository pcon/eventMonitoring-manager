const qutils = require('../../../lib/utils/qutils');

describe('Handle All Settled', function () {
    test('No errors', function () {
        const resolve = jest.fn();
        const reject = jest.fn();
        const result = {
            state: 'fulfilled'
        };

        const results = [result, result];

        qutils.handleAllSettled(results, resolve, reject);
        expect(resolve).toBeCalled();
        expect(reject).not.toBeCalled();
    });

    test('Has errors', function () {
        const resolve = jest.fn();
        const reject = jest.fn();
        const result_normal = {
            state: 'fulfilled'
        };
        const result_error1 = {
            state: 'unfulfilled',
            reason: 'I AM ERROR'
        };
        const result_error2 = {
            state: 'unfulfilled',
            reason: 'NOT HAVING A GOOD TIME'
        };

        const results = [result_error1, result_normal, result_error2];

        qutils.handleAllSettled(results, resolve, reject);
        expect(resolve).not.toBeCalled();
        expect(reject).toBeCalledWith([new Error('I AM ERROR'), new Error('NOT HAVING A GOOD TIME')]);
    });
});