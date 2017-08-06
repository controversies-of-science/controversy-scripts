'use strict';

var _utils = require('./libs/utils');

var _config = require('./libs/config');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var feedBucketID = void 0,
    feedThumbnailList = [];

function fetchFeedThumbnailList() {
	return new Promise(function (resolve, reject) {

		var fetchFeedDirectory = function fetchFeedDirectory(count) {
			_fs2.default.readdir(_config.dir.images.feeds[count], function (err, files) {

				if (err) {
					reject(err);
				}

				if (count < _config.dir.images.feeds.length - 1) {
					var fileList = (0, _utils.removeSystemFiles)(files),
					    fullPathFileList = fileList.map(function (slug) {
						return _config.dir.images.feeds[count] + slug;
					});

					feedThumbnailList.push.apply(feedThumbnailList, _toConsumableArray(fullPathFileList));

					++count;
					fetchFeedDirectory(count);
				} else {
					resolve();
				}
			});
		};

		fetchFeedDirectory(0);
	});
}

function getSlugFromPath(path) {
	var pathParts = path.split('/');
	return pathParts[pathParts.length - 1];
}

function getLevelFromPath(path) {
	var pathParts = path.split('/');
	return pathParts[pathParts.length - 2];
}

// TODO: Debug one-off error where the first upload fails
function copyFeedThumbnails() {
	return new Promise(function (resolve, reject) {
		var totalFeeds = feedThumbnailList.length;

		var copyFeed = function copyFeed(feedCount) {
			var feedPath = feedThumbnailList[feedCount];

			var feedSlug = getSlugFromPath(feedPath),
			    discourseLevel = getLevelFromPath(feedPath);

			(0, _utils.copyThumbnailToS3)(feedPath + '/thumbnail.jpg', feedBucketID, 'halton-arp-the-modern-galileo/' + discourseLevel + '/' + feedSlug).then(function () {
				++feedCount;

				if (feedCount === totalFeeds) {
					resolve();
				} else {
					copyFeed(feedCount);
				}
			});
		};

		copyFeed(0);
	});
}

fetchFeedThumbnailList().then(function () {
	feedBucketID = (0, _utils.getIDFromS3URL)(_config.url.feeds);

	return copyFeedThumbnails();
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});