const EventEmitter = require('events');
const split = require('split');

const Group = require('./group');

const typeLookups = {
	'%': 'pragma',
	'"': 'comment',
	'.': 'pass',
	'?': 'skip',
	'!': 'fail',
	'(': 'open',
	')': 'close'
};

module.exports = function (source) {
	let currentGroup = new Group('root');
	const stack = [ currentGroup ];

	const stream = new EventEmitter();

	stream.on('pragma', function (payload) {
		const [ pragmaType, pragmaArgument ] = payload.split(' ');

		switch (pragmaType) {
			case 'uto':
				break;
			case 'count':
				currentGroup.incrementExpected(parseInt(pragmaArgument, 10));
				break;
		}
	});

	stream.on('comment', function (payload) { });

	stream.on('pass', function (payload) {
		currentGroup.incrementActual();
	});

	stream.on('skip', function (payload) {
		currentGroup.incrementActual();
	});

	stream.on('fail', function (payload) {
		currentGroup.incrementActual();
	});

	stream.on('open', function (payload) {
		currentGroup.incrementActual();
		currentGroup = new Group(payload);
		stack.push(currentGroup);
	});

	stream.on('close', function (payload) {
		stack.pop();
		currentGroup = stack[stack.length - 1];
	});

	source.pipe(split(null, function (line) {
		if (line.trim()) {
			return line.replace(/ */, '');
		} else {
			return undefined;
		}
	})).on('data', function (line) {
		const eventType = typeLookups[line[0]];
		const payload = line.substring(1).trim();

		stream.emit(eventType, payload);
	}).on('end', function () {
		stream.emit('end');
	});

	return stream;
}
