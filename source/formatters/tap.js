module.exports = function (stream) {
	let planCount = 0;
	let actualCount = 0;

	const printPlan = function () {
		if (planCount > 0) {
			console.log(`1..${planCount}`);
		} else {
			console.log(`1..${actualCount}`);
		}
	};

	stream.on('pragma', function (payload) {
		const [ pragmaType, pragmaArgument ] = payload.split(' ');

		switch (pragmaType) {
			case 'uto':
				console.log('TAP version 13');
				break;
			case 'count':
				planCount = planCount + parseInt(pragmaArgument, 10);
				break;
		}
	});

	stream.on('pass', function (payload) {
		console.log(`ok ${++actualCount} ${payload}`);
	});

	stream.on('skip', function (payload) {
		console.log(`ok ${++actualCount} # SKIP ${payload}`);
	});

	stream.on('fail', function (payload) {
		console.log(`not ok ${++actualCount} ${payload}`);
	});

	stream.on('open', function (payload) {
		planCount = planCount - 1;
	});

	stream.on('end', printPlan);

	stream.on('error', function (payload) {
		printPlan();
		console.log(`Bail out! ${payload}`);
		process.exit(1);
	});
};
