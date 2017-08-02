'use strict';

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var algolia = {
	card: {
		images: [] // full local image pathnames
	}
};

// grab all controversy card image directories
new Promise(function (resolve, reject) {
	_fs2.default.readdir(_config.dir.images.cards, function (err, files) {
		if (err) {
			reject(err);
		} else {
			var fullPathFilenames = files.map(function (filename) {
				return _config.dir.images.cards + filename;
			});
			resolve(fullPathFilenames);
		}
	});
})

// Generate thumbnails for the card posts
.then(function (cardImageDirectories) {
	console.log('\nGenerating thumbnails from card posts ...\n');

	algolia.card.images = (0, _utils.removeSystemFiles)(cardImageDirectories);
	var cardCount = 0;

	return new Promise(function (resolve, reject) {
		var syncThumbnail = function syncThumbnail() {
			_fs2.default.readdir(algolia.card.images[cardCount], function (readdir_err, files) {

				if (readdir_err) {
					reject(readdir_err);
				}

				// createThumbnail(input, output, isAlreadyGenerated)
				(0, _utils.createThumbnail)(algolia.card.images[cardCount], algolia.card.images[cardCount], files.includes('thumbnail.jpg')).then(function () {
					if (!files.includes('thumbnail.jpg')) {
						console.log('Thumbnail generated for ' + algolia.card.images[cardCount]);
					}

					if (cardCount < algolia.card.images.length) {
						syncThumbnail();
					} else {
						resolve();
					}
				}).catch(function (err) {
					reject(err);
				});

				cardCount++;
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