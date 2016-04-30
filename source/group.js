const Group = module.exports = class {
	constructor(label) {
		this.label = label;
		this.expected = 0;
		this.actual = 0;
	}

	incrementExpected(count) {
		this.expected = this.expected + count;
	}

	incrementActual() {
		this.actual = this.actual + 1;
	}

	isValid() {
		return this.expected === this.actual;
	}
};
