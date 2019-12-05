const jsonfile = jest.genMockFromModule('jsonfile');
jest.mock('jsonfile');

jsonfile.readFile = jest.fn();
jsonfile.writeFile = jest.fn();

module.exports = jsonfile;