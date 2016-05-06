## Univeral Test Output

Universal Test Output (UTO) is an alternative to [Test Anything Protocol](http://testanything.org/). The primary motivation is a cleaner syntax that retains readability. More information and the specification is available on [Github](https://github.com/universal-test-output/uto-specification).


### Installation

```
$ npm install --save-dev uto-node
```


### Usage (CLI)

Pipe UTO output to `./node_modules/.bin/uto`. See `./node_modules/.bin/uto --help` for more information.


### Usage (API)

The core library is available as a Node module.

```javascript
const uto = require('uto-node');

const stream = uto(process.stdin); // Can also pass a multiline string

stream.on('pragma', function (payload) {});

stream.on('comment', function (payload) {});

stream.on('pass', function (payload) {});
stream.on('skip', function (payload) {});
stream.on('fail', function (payload) {});

stream.on('open', function (payload) {});
stream.on('close', function (payload) {});

stream.on('error', function (payload) {});

stream.on('end', function (payload) {});
```
