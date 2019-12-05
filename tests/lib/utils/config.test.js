const lodash = require('lodash');
const jsonfile = require('jsonfile');

jest.mock('jsonfile');

beforeEach(function () {
    jest.restoreAllMocks();
    global.config = {};
    delete process.env.CONFIG_ROOT;
});

afterEach(function () {
    jest.clearAllMocks();
});

var config = require('../../../lib/utils/config');
var consts = require('../../../lib/consts');

describe('Get config filename', function () {
    test('No environment variable', function () {
        var expected = consts.app.config;
        expect(config.getConfigFilename()).toEqual(expected);
    });

    test('Environment variable set', function () {
        process.env.CONFIG_ROOT = '/path/to/storage';

        var expected = `/path/to/storage/${consts.app.config}`;
        expect(config.getConfigFilename()).toEqual(expected);
    });
});

describe('Load config', function () {
    test('Successful read', function () {
        expect.assertions(1);

        const contents = {
            foo: 'bar'
        };

        jsonfile.readFile.mockResolvedValue(contents);

        return config.loadConfig().then(function () {
            var expected = lodash.merge(consts.DEFAULTS, contents);
            expect(global.config).toEqual(expected);
        });
    });

    test('Failed read', function () {
        expect.assertions(2);

        const message = 'ERROR MESSAGE GOES HERE';

        jsonfile.readFile.mockRejectedValue(message);

        return config.loadConfig().catch(function (err) {
            expect(global.config).toEqual({});
            expect(err).toEqual(message);
        });
    });
});

describe('Save config', function () {
    test('Successful write', function () {
        expect.assertions(2);

        jsonfile.writeFile.mockResolvedValue();

        return config.saveConfig().then(function () {
            expect(jsonfile.writeFile).toHaveBeenCalledTimes(1);
            expect(jsonfile.writeFile).toHaveBeenCalledWith(consts.app.config, global.config);
        });
    });
});