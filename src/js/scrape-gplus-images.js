'use strict';

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./libs/config');

var _utils = require('./libs/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Get the controversy cards data from disk 
new Promise(function (resolve, reject) {
	resolve((0, _loadJsonFile2.default)(_config.output.gplus));
}).then(function (cards) {
	console.log('\nSaving large-format controversy card images based upon the G+ Controversies of Science collection in ' + _config.dir.images.cards + '. Be aware that the G+ API does not always provide the correct URL for these large-format images.  I STRONGLY recommend that you check the dimensions for all of them once they are downloaded.');

	var promiseArray = cards.map(function (card) {
		return new Promise(function (resolve, reject) {

			var slug = (0, _utils.createSlug)(card.name),
			    imageDirectory = _config.dir.images.cards + slug;

			// Check if we have read/write access to the directory
			_fs2.default.access(imageDirectory, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (access_err) {

				// Slug-named directory does not exist
				if (access_err) {
					console.log('\nThe image directory ' + imageDirectory + ' does not exist. Please run the scrape-gplus-directories script first.\n');

					reject();

					// Directory exists, save large-format image file ...
				} else {
					console.log('Saving image for ' + imageDirectory);

					(0, _utils.saveImage)(card.image, imageDirectory + '/large.jpg', resolve, reject);
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