const request = jest.genMockFromModule('request');
jest.mock('request');

request.get = jest.fn().mockImplementation(function (data) {
    return new Promise(function (resolve) {
        resolve(data);
    });
});

module.exports = request;