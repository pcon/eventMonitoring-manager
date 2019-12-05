const express = jest.genMockFromModule('express');
jest.mock('express');

express.Router = jest.fn().mockImplementation(function () {
    return {
        use: jest.fn()
    };
});

module.exports = express;