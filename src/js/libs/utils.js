'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSlug = createSlug;
exports.saveImage = saveImage;
exports.splitText = splitText;
exports.createThumbnail = createThumbnail;
exports.removeSystemFiles = removeSystemFiles;
var fs = require('fs'),
    Thumbnail = require('thumbnail'),
    slugify = require('slugify');

// Slugify controversy card titles, lower the casing, then remove periods and apostrophes
function createSlug(cardName) {
	var slugInitial = slugify(cardName),
	    slugLower = slugInitial.toLowerCase(),
	    slugFinal = slugLower.replace(/['.]/g, '');

	return slugFinal;
}

// Captures image from URL to local disk
function saveImage(url, destination, resolve, reject) {
	request.get({ url: url, encoding: 'binary' }, function (err, response, body) {
		fs.writeFile(destination, body, 'binary', function (err) {
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

// TODO: Rename resulting file to thumbnail.jpg
function createThumbnail(input, output, isAlreadyGenerated) {
	return new Promise(function (resolve, reject) {
		if (isAlreadyGenerated) {
			console.log('Thumbnail already generated for ' + input);
			resolve();
		} else {
			var thumbnail = new Thumbnail(input, output);

			thumbnail.ensureThumbnail('large.jpg', thumbnailSize, thumbnailSize, function (err, filename) {
				if (err) {
					reject(err);
				} else {
					resolve();
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