'use strict';

var _admZip = require('adm-zip');

var _admZip2 = _interopRequireDefault(_admZip);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./libs/config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var zip = void 0,
    rawQuotes = void 0;

new Promise(function (resolve, reject) {
	resolve(new _admZip2.default(_config.dir.alfred));
})

// Alfred Snippet exports are stored as a set of zipped JSON files
.then(function (zip) {
	zip.extractAllTo('alfred/json', true);
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});