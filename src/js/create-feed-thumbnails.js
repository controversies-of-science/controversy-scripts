'use strict';

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var algolia = {
	feed: {
		images: [] // full local image pathnames
	}
};

// grab all controversy feed image directories
new Promise(function (resolve, reject) {
	var fullPathFilenames = [],
	    layerCount = 0;

	_config.dir.images.feeds.forEach(function (feedLayer) {
		_fs2.default.readdir(feedLayer, function (err, files) {
			if (err) {
				reject(err);
			} else {
				var filenames = files.map(function (filename) {
					return feedLayer + filename;
				});

				fullPathFilenames.push.apply(fullPathFilenames, _toConsumableArray(filenames));

				// Always 5 layers of discourse
				if (layerCount === 4) {
					resolve(fullPathFilenames);
				}

				++layerCount;
			}
		});
	});
})

// Generate thumbnails for the feed posts
.then(function (feedImageDirectories) {
	console.log('\nGenerating thumbnails from feed posts ...\n');

	algolia.feed.images = (0, _utils.removeSystemFiles)(feedImageDirectories);
	var feedCount = 0;

	return new Promise(function (resolve, reject) {
		var syncThumbnail = function syncThumbnail() {
			_fs2.default.readdir(algolia.feed.images[feedCount], function (readdir_err, files) {

				if (readdir_err) {
					reject(readdir_err);
				}

				// createThumbnail(input, output, isAlreadyGenerated)
				(0, _utils.createThumbnail)(algolia.feed.images[feedCount], algolia.feed.images[feedCount], files.includes('thumbnail.jpg')).then(function () {
					if (!files.includes('thumbnail.jpg')) {
						console.log('Thumbnail generated for ' + algolia.feed.images[feedCount]);
					}

					if (feedCount < algolia.feed.images.length - 1) {
						++feedCount;
						syncThumbnail();
					} else {
						resolve();
					}
				}).catch(function (err) {
					reject(err);
				});
			});
		};

		syncThumbnail();
	});
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});