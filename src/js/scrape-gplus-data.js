'use strict';

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var GPlus = require('./libs/gplus').default;

var gplusKeysExist = false;

function scrapeCollection(resolve, reject) {
	console.log('\nSynchronizing backend with Google Plus collection ...');

	var gplus = new GPlus();
	gplus.init();

	// Recursive promise chain to deal with API pagination
	// GPlus class handles aggregation of data
	var getPage = function getPage() {
		gplus.scrapeCards().then(function (data) {
			// Send back an array of the card titles which have been added
			if (gplus.nextPageToken && gplus.more) {
				getPage();
			} else {
				console.log('\nScrape Results:\n');
				console.log([].concat(_toConsumableArray(gplus.titlesAdded)));

				resolve(gplus.getCollection());
			}
		}).catch(function (data) {
			console.log("\nAlthough keys do indeed exist to access the G+ API, either the keys are invalid or the request has failed. If you wish to proceed without scraping the G+ API, consider removing the keys from your environment variables.");
			console.log("Status Code: " + data.statusCode);
			console.log("Error: " + data.error);

			reject();
		});
	};

	getPage();
}

new Promise(function (resolve, reject) {
	console.log("\nChecking for Google+ API Keys in local environment.");
	gplusKeysExist = GPlus.keysExist();

	if (!gplusKeysExist) {
		console.log("\nNo keys found, will not scrape metadata.");

		resolve(null);
	} else {
		console.log("\nScraping G+ Collection.");

		scrapeCollection(resolve, reject);
	}
})

// Save the result to disk
.then(function (collection) {
	new Promise(function (resolve, reject) {
		_fs2.default.writeFile(_config.output.gplus, JSON.stringify(collection), 'utf-8', function (err) {

			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});