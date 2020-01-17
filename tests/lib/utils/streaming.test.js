beforeEach(function () {
    jest.restoreAllMocks();
    jest.resetModules();

    global.config = {
        monitoring: {
            db_name: 'monitoring'
        }
    };
});

afterEach(function () {
    jest.clearAllMocks();
});

/**
 * Resolves without an errors
 * @returns {Promise} A promise
 */
function resolve_cleanly() {
    return new Promise(function (resolve) {
        resolve();
    });
}

/**
 * Rejects with an error
 * @returns {Promise} A promise
 */
function rejects() {
    return new Promise(function (resolve, reject) {
        reject('I AM ERROR');
    });
}

test('Get Job Name', function () {
    const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
    const topic = 'ApiEventStream';
    const expected = 'Streaming - ApiEventStream';

    expect(streaming.getJobName(topic)).toBe(expected);
});

describe('Subscribe', function () {
    test('Successful', function () {
        expect.assertions(3);

        const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
        const sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

        const faye_client = {
            subscribe: jest.fn()
        };

        sfdc.login = jest.fn().mockImplementation(resolve_cleanly);
        sfdc.getFayeClient = jest.fn().mockImplementation(function () {
            return faye_client;
        });

        const job = {
            attrs: {
                data: {
                    topic: 'ApiEventStream'
                }
            },
            touch: jest.fn()
        };

        return streaming.__subscribe(job)
            .then(function () {
                expect(sfdc.login).toBeCalled();
                expect(sfdc.getFayeClient).toBeCalledWith('ApiEventStream', -1);
                expect(faye_client.subscribe).toBeCalledWith('/event/ApiEventStream', expect.any(Function));
            });
    });

    test('Failure - Login', function () {
        expect.assertions(4);

        const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
        const sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

        const faye_client = {
            subscribe: jest.fn()
        };

        sfdc.login = jest.fn().mockImplementation(rejects);
        sfdc.getFayeClient = jest.fn().mockImplementation(function () {
            return faye_client;
        });

        const job = {
            attrs: {
                data: {
                    topic: 'ApiEventStream'
                }
            },
            touch: jest.fn()
        };

        return streaming.__subscribe(job)
            .catch(function (err) {
                expect(sfdc.login).toBeCalled();
                expect(sfdc.getFayeClient).not.toBeCalled();
                expect(faye_client.subscribe).not.toBeCalled();
                expect(err).toMatch('I AM ERROR');
            });
    });

    test('Failure - Handle Subscription', function () {
        expect.assertions(4);

        const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
        const sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

        const faye_client = {
            subscribe: jest.fn()
        };

        sfdc.login = jest.fn().mockImplementation(resolve_cleanly);
        sfdc.getFayeClient = jest.fn().mockImplementation(function () {
            throw new Error('I AM OTHER ERROR');
        });

        const job = {
            attrs: {
                data: {
                    topic: 'ApiEventStream'
                }
            },
            touch: jest.fn()
        };

        return streaming.__subscribe(job)
            .catch(function (err) {
                expect(sfdc.login).toBeCalled();
                expect(sfdc.getFayeClient).toBeCalled();
                expect(faye_client.subscribe).not.toBeCalled();
                expect(err.message).toMatch('I AM OTHER ERROR');
            });
    });
});

test('Handle subscription', function () {
    const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
    const sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

    const faye_client = {
        subscribe: jest.fn().mockImplementation(function (topic, cb) {
            cb({});
        })
    };

    sfdc.login = jest.fn().mockImplementation(resolve_cleanly);
    sfdc.getFayeClient = jest.fn().mockImplementation(function () {
        return faye_client;
    });

    const job = {
        attrs: {
            data: {
                topic: 'ApiEventStream'
            }
        },
        touch: jest.fn()
    };

    streaming.__handleSubscription('ApiEventStream', -1, job);
    expect(faye_client.subscribe).toBeCalled();
});

describe('Handle Data', function () {
    test('No payload', function () {
        expect.assertions(2);
        const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
        const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

        mongo.insert = jest.fn();

        return streaming.__handleData('Topic Name', {}, {}).catch(function (err) {
            expect(err.message).toMatch('No payload sent');
            expect(mongo.insert).not.toBeCalled();
        });
    });

    describe('Handler - Mongo', function () {
        test('Success - Event Identifier', function () {
            expect.assertions(2);
            const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
            const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

            mongo.insert = jest.fn().mockImplementation(resolve_cleanly);

            const topic = 'Topic Name';

            const job = {
                touch: jest.fn(),
                fail: jest.fn()
            };

            const data = {
                payload: {
                    EventIdentifier: 'abc123'
                }
            };

            const expected = {
                EventIdentifier: 'abc123',
                _id: 'abc123'
            };

            return streaming.__handleData(topic, job, data)
                .then(function () {
                    expect(mongo.insert).toBeCalledWith('monitoring', topic, expected);
                    expect(job.touch).toBeCalled();
                });
        });

        test('Success - No Event Identifier', function () {
            expect.assertions(2);
            const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
            const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

            mongo.insert = jest.fn().mockImplementation(resolve_cleanly);

            const topic = 'Topic Name';

            const job = {
                touch: jest.fn(),
                fail: jest.fn()
            };

            const data = {
                payload: {
                    Foo: 'bar'
                }
            };

            const expected = {
                Foo: 'bar'
            };

            return streaming.__handleData(topic, job, data)
                .then(function () {
                    expect(mongo.insert).toBeCalledWith('monitoring', topic, expected);
                    expect(job.touch).toBeCalled();
                });
        });

        test('Failure', function () {
            expect.assertions(3);
            const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
            const mongo = require('../../../lib/utils/mongo'); // eslint-disable-line global-require

            mongo.insert = jest.fn().mockImplementation(rejects);

            const topic = 'Topic Name';

            const job = {
                touch: jest.fn(),
                fail: jest.fn()
            };

            const data = {
                payload: {
                    EventIdentifier: 'abc123'
                }
            };

            const expected = {
                EventIdentifier: 'abc123',
                _id: 'abc123'
            };

            return streaming.__handleData(topic, job, data)
                .catch(function (err) {
                    expect(mongo.insert).toBeCalledWith('monitoring', topic, expected);
                    expect(job.fail).toBeCalledWith('I AM ERROR');
                    expect(err).toMatch('I AM ERROR');
                });
        });
    });
});

describe('Handle stream', function () {
    test('Successful', function () {
        expect.assertions(3);

        const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
        const sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

        const faye_client = {
            subscribe: jest.fn()
        };

        sfdc.login = jest.fn().mockImplementation(resolve_cleanly);
        sfdc.getFayeClient = jest.fn().mockImplementation(function () {
            return faye_client;
        });

        const job = {
            attrs: {
                data: {
                    topic: 'ApiEventStream'
                }
            },
            touch: jest.fn()
        };

        return streaming.__subscribe(job)
            .then(function () {
                expect(sfdc.login).toBeCalled();
                expect(sfdc.getFayeClient).toBeCalledWith('ApiEventStream', -1);
                expect(faye_client.subscribe).toBeCalledWith('/event/ApiEventStream', expect.any(Function));
            });
    });

    test('Failure', function () {
        expect.assertions(4);

        const streaming = require('../../../lib/utils/streaming'); // eslint-disable-line global-require
        const sfdc = require('../../../lib/utils/sfdc'); // eslint-disable-line global-require

        const faye_client = {
            subscribe: jest.fn()
        };

        sfdc.login = jest.fn().mockImplementation(rejects);
        sfdc.getFayeClient = jest.fn().mockImplementation(function () {
            return faye_client;
        });

        const job = {
            attrs: {
                data: {
                    topic: 'ApiEventStream'
                }
            },
            touch: jest.fn()
        };

        return streaming.handle_stream(job)
            .catch(function (err) {
                expect(sfdc.login).toBeCalled();
                expect(sfdc.getFayeClient).not.toBeCalled();
                expect(faye_client.subscribe).not.toBeCalled();
                expect(err).toMatch('I AM ERROR');
            });
    });
});