'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSlug = createSlug;
exports.saveImage = saveImage;
exports.splitText = splitText;
exports.createThumbnail = createThumbnail;
exports.removeSystemFiles = removeSystemFiles;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _thumbnail = require('thumbnail');

var _thumbnail2 = _interopRequireDefault(_thumbnail);

var _slugify = require('slugify');

var _slugify2 = _interopRequireDefault(_slugify);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Slugify controversy card titles, lower the casing, then remove periods and apostrophes
function createSlug(cardName) {
	var slugInitial = (0, _slugify2.default)(cardName),
	    slugLower = slugInitial.toLowerCase(),
	    slugFinal = slugLower.replace(/['.]/g, '');

	return slugFinal;
}

// Captures image from URL to local disk
function saveImage(url, destination, resolve, reject) {
	_request2.default.get({ url: url, encoding: 'binary' }, function (err, response, body) {
		_fs2.default.writeFile(destination, body, 'binary', function (err) {
			if (err) {
				reject(err);
			} else {
				console.log(destination + ' successfully saved.');
				resolve();
			}
		});
	});
}

// Algolia Search requires chunking by paragraph
function splitText(slug, text, breakString) {
	return text.split(breakString).map(function (paragraph, i) {
		return {
			id: slug + '-paragraph-' + i,
			paragraph: paragraph
		};
	});
}

// Generate thumbnail.jpg from large.jpg for entire directory.  Width is set in
// config.es
function createThumbnail(input, output, isAlreadyGenerated) {
	return new Promise(function (resolve, reject) {
		if (isAlreadyGenerated) {
			console.log('Thumbnail already generated for ' + input);
			resolve();
		} else {
			var thumbnail = new _thumbnail2.default(input, output);

			// null parameter sets height to auto
			thumbnail.ensureThumbnail('large.jpg', _config.thumbnailSize, null, function (err, filename) {

				if (err) {
					reject(err);
				} else {
					// Rename to thumbnail.jpg
					_fs2.default.rename(input + '/' + filename, input + '/thumbnail.jpg', function () {
						resolve();
					});
				}
			});
		}
	});
}

function removeSystemFiles(list) {
	return list.filter(function (el) {
		return !el.match(/\.DS_Store/);
	});
}