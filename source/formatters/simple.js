const chalk = require('chalk');

const indent = function (level) {
	return new Array(level + 1).join('   ');
};

module.exports = function (stream) {
	const events = [];

	let level = 0;

	const printPayload = function (color, mark, payload) {
		console.log(`${indent(level)}${color.bold(mark)} ${color(payload)}`);
	};

	stream.on('pass', function (payload) {
		events.push({ type: 'pass', payload: payload });
		printPayload(chalk.green, '✓', payload);
	});

	stream.on('skip', function (payload) {
		events.push({ type: 'skip', payload: payload });
		printPayload(chalk.yellow, '•', payload);
	});

	stream.on('fail', function (payload) {
		events.push({ type: 'fail', payload: payload });
		printPayload(chalk.red, '✗', payload);
	});

	stream.on('open', function (payload) {
		level = level + 1;
	});

	stream.on('close', function (payload) {
		level = level - 1;
	});

	stream.on('end', function () {
		const counts = [
			[ 'pass', chalk.green ],
			[ 'skip', chalk.yellow ],
			[ 'fail', chalk.red ]
		].map(function (typeColor) {
			const [ type, color ] = typeColor;

			const count = events.filter(function (e) {
				return e.type === type;
			}).length;

			return `${color.bold(count)} ${color(type)}`;
		}).join(', ');

		console.log(`${chalk.blue.bold(events.length)} ${chalk.blue('assertions')} (${counts})`);
	});

	stream.on('error', function (payload) {
		console.error(payload);
		process.exit(1);
	});
};
