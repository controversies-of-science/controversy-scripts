'use strict';

var _utils = require('./libs/utils');

var _config = require('./libs/config');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cardBucketID = void 0,
    cardThumbnailList = [];

function fetchCardThumbnailList() {
	return new Promise(function (resolve, reject) {
		_fs2.default.readdir(_config.dir.images.cards, function (err, files) {
			if (err) {
				reject(err);
			} else {
				resolve((0, _utils.removeSystemFiles)(files));
			}
		});
	});
}

function getSlugFromPath(path) {
	var pathParts = path.split('/');
	return pathParts[pathParts.length - 1];
}

// TODO: Debug one-off error where the first upload fails
function copyCardThumbnails() {
	return new Promise(function (resolve, reject) {
		var total = cardThumbnailList.length;

		var copy = function copy(count) {
			var thumbnailPath = cardThumbnailList[count],
			    cardSlug = getSlugFromPath(thumbnailPath);

			(0, _utils.copyThumbnailToS3)(thumbnailPath + '/thumbnail.jpg', cardBucketID, cardSlug).then(function () {
				++count;

				if (count === total) {
					resolve();
				} else {
					copy(count);
				}
			});
		};

		copy(0);
	});
}

fetchCardThumbnailList().then(function (files) {
	cardThumbnailList = files.map(function (file) {
		return _config.dir.images.cards + file;
	});
	cardBucketID = (0, _utils.getIDFromS3URL)(_config.url.cards);

	return copyCardThumbnails();
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});