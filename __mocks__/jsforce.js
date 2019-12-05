const lodash = require('lodash');

const jsforce = jest.genMockFromModule('jsforce');
jest.mock('jsforce');

jsforce.Connection = jest.fn().mockImplementation(function (opts) {
    var defaults = {
        login: jest.fn(),
        query: jest.fn(),
        streaming: {
            createClient: jest.fn()
        }
    };

    return lodash.merge(defaults, opts);
});

jsforce.StreamingExtension = {
    Replay: jest.fn(),
    AuthFailure: jest.fn()
};

module.exports = jsforce;