'use strict';

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./libs/config');

var _utils = require('./libs/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Check if we have read/write access on the top-level cards directory
new Promise(function (resolve, reject) {
	console.log('\nChecking that the ' + _config.dir.images.cards + ' directory already exists.  If it doesn\'t, will generate ...');

	_fs2.default.access(_config.dir.images.cards, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (access_err) {

		// Does not yet exist, create it
		if (access_err) {
			console.log('\nCards directory does not exist, creating it ...');

			_fs2.default.mkdir(_config.dir.images.cards, function (mkdir_err, folder) {
				if (mkdir_err) {
					reject(mkdir_err);
				} else {
					resolve();
				}
			});

			// Directory already exists
		} else {
			console.log('\nCards directory already exists ...');

			resolve();
		}
	});
})

// Get the controversy cards data from disk 
.then(function () {
	return new Promise(function (resolve, reject) {
		resolve((0, _loadJsonFile2.default)(_config.output.gplus));
	});
}).then(function (cards) {
	console.log('\nCreating controversy card directories based upon the G+ Controversies of Science collection in ' + _config.dir.images.cards + '.  Directories which already exist will be ignored ...\n');

	var promiseArray = cards.map(function (card) {
		return new Promise(function (resolve, reject) {

			var slug = (0, _utils.createSlug)(card.name),
			    imageDirectory = _config.dir.images.cards + slug;

			// Check if we have read/write access to the directory
			_fs2.default.access(imageDirectory, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (access_err) {

				// Slug-named directory does not exist
				if (access_err) {
					console.log('Creating directory ' + imageDirectory);

					_fs2.default.mkdir(imageDirectory, function (mkdir_err, folder) {
						if (mkdir_err) {
							reject(mkdir_err);
						} else {
							resolve();
						}
					});

					// Directory exists ...
				} else {
					console.log('Skipping creation of directory ' + imageDirectory);

					resolve();
				}
			});
		});
	});

	return Promise.all(promiseArray);
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});