'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSlug = createSlug;
exports.saveImage = saveImage;
exports.splitText = splitText;
exports.createThumbnail = createThumbnail;
exports.copyThumbnailToS3 = copyThumbnailToS3;
exports.getIDFromS3URL = getIDFromS3URL;
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

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Slugify controversy card titles, lower the casing, then remove periods and apostrophes
function createSlug(cardName) {
	var slugInitial = (0, _slugify2.default)(cardName),
	    slugLower = slugInitial.toLowerCase(),
	    slugFinal = slugLower.replace(/['.]/g, '');

	return slugFinal;
}

// Captures image from URL to local disk

// import { execSync } from 'child_process';
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
	var removeFirstParagraph = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	var allParagraphs = text.split(breakString).map(function (paragraph, i) {
		var count = removeFirstParagraph ? i - 1 : i;

		return {
			id: slug + '-paragraph-' + count,
			paragraph: paragraph
		};
	});

	// Notice that we sometimes remove the first paragraph of the text -- which is always
	// the summary. This requires that we also decrement our i counter above when counting
	// out the paragraphs.
	return removeFirstParagraph ? allParagraphs.filter(function (paragraph, num) {
		return num > 0;
	}) : allParagraphs;
}

// Generate [thumbnailFilename] from large.jpg for entire directory.  Width is set in
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
					_fs2.default.rename(input + '/' + filename, input + '/' + _config.thumbnailFilename, function () {
						resolve();
					});
				}
			});
		}
	});
}

// This differs from an 'aws s3 sync' in that it uploads files without
// affecting the rest of the existing s3 bucket.  This function assumes
// that a profile named 'controversy' has already been set for the
// AWS credentials file.  See http://docs.aws.amazon.com/
// sdk-for-javascript/v2/developer-guide/
// loading-node-credentials-shared.html.
function copyThumbnailToS3(thumbnailPath, bucketID, cardSlug) {
	var s3 = void 0;

	return new Promise(function (resolve, reject) {
		s3 = new _awsSdk2.default.S3();

		resolve(new _awsSdk2.default.SharedIniFileCredentials({
			profile: 'serverless'
		}));
	}).then(function (credentials) {
		_awsSdk2.default.config.credentials = credentials;
		var bucketKey = cardSlug + '/' + _config.thumbnailFilename;

		console.log('Copying ' + thumbnailPath + ' to s3://' + bucketID + '/' + bucketKey);

		return new Promise(function (resolve, reject) {
			_fs2.default.readFile(thumbnailPath, function (err, data) {
				if (err) {
					reject(err);
				}

				var params = {
					Bucket: bucketID,
					Key: bucketKey,
					Body: data
				};

				console.log('bucketID:');
				console.log(bucketID);

				console.log('\nbucketKey:');
				console.log(bucketKey);

				console.log('\nBody:');
				console.log(data);

				s3.upload(params, function (err, data) {
					if (err) {
						console.log(err);
						reject(err);
					} else {
						resolve();
					}
				});
			});
		});
	}).catch(function (error) {
		console.log("\nAn error has occurred ...");

		if (error) {
			console.log(error);
		}
	});
}

// The full array result looks like:
// [ 'https://controversy-cards-images.s3.amazonaws.com/',
// 'https://',
// 'controversy-cards-images',
// '.s3.amazonaws.com/',
// index: 0,
// input: 'https://controversy-cards-images.s3.amazonaws.com/' ]
function getIDFromS3URL(url) {
	var re = /^(https:\/\/)(.+)(\.s3\.amazonaws\.com\/)/;

	return re.exec(url)[2];
}

function removeSystemFiles(list) {
	return list.filter(function (el) {
		return !el.match(/\.DS_Store/);
	});
}