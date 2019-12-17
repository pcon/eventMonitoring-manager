const mongo = jest.genMockFromModule('mongodb');
jest.mock('mongodb');

module.exports = mongo;