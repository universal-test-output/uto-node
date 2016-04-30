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

	let allowVersionPragma = false;

	stream.on('pragma', function (payload) {
		const [ pragmaType, pragmaArgument ] = payload.split(' ');

		switch (pragmaType) {
			case 'uto':
				if (!allowVersionPragma) {
					stream.emit('error', 'Version pragma must be emitted only once');
				}

				if (pragmaArgument !== 'v1.0') {
					stream.emit('error', `Unknown UTO specification version: ${pragmaArgument}`);
				}

				allowVersionPragma = false;
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
		if (currentGroup.isValid()) {
			stack.pop();
			currentGroup = stack[stack.length - 1];

			if (!currentGroup) {
				stream.emit('error', 'Group closed without being opened');
			}
		} else {
			stream.emit('error', 'Group closed without making expected number of assersions');
		}
	});

	source.pipe(split(null, function (line) {
		if (line.trim()) {
			return line.replace(/ */, '');
		} else {
			return undefined;
		}
	})).once('data', function (line) {
		const payload = line.substring(1).trim();
		const [ pragmaType, pragmaArgument ] = payload.split(' ');

		if (pragmaType !== 'uto') {
			stream.emit('error', 'Version pragma must come first');
		}

		allowVersionPragma = true;
	}).on('data', function (line) {
		const eventType = typeLookups[line[0]];
		const payload = line.substring(1).trim();

		stream.emit(eventType, payload);
	}).on('end', function () {
		if (stack.length !== 1) {
			stream.emit('error', 'Group opened without being closed');
		} else if (!currentGroup.isValid()) {
			stream.emit('error', 'Input terminated without passing expected number of assersions');
		}

		stream.emit('end');
	});

	return stream;
}
