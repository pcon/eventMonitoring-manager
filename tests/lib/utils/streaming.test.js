const streaming = require('../../../lib/utils/streaming');

test('Get Job Name', function () {
    const topic = 'ApiEventStream';
    const expected = 'Streaming - ApiEventStream';

    expect(streaming.getJobName(topic)).toBe(expected);
});