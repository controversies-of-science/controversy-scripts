const
	fs = require('fs'),
	Thumbnail = require('thumbnail'),
	slugify = require('slugify');

// Slugify controversy card titles, lower the casing, then remove periods and apostrophes
export function createSlug(cardName) {
	let slugInitial = slugify(cardName),
		slugLower = slugInitial.toLowerCase(),
		slugFinal = slugLower.replace(/['.]/g, '');

	return slugFinal;
}

// Captures image from URL to local disk
export function saveImage(url, destination, resolve, reject) {
	request.get({url, encoding: 'binary'}, (err, response, body) => {
		fs.writeFile(destination, body, 'binary', err => {
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
export function splitText(slug, text, breakString) {
	return text.split(breakString).map((paragraph, i) => {
		return {
			id: slug + '-paragraph-' + i,
			paragraph
		}
	});
}

// TODO: Rename resulting file to thumbnail.jpg
export function createThumbnail(input, output, isAlreadyGenerated) {
	return new Promise((resolve, reject) => {
		if (isAlreadyGenerated) {
			console.log('Thumbnail already generated for ' + input);
			resolve();
		} else {
			let thumbnail = new Thumbnail(input, output);

			thumbnail.ensureThumbnail('large.jpg', thumbnailSize, thumbnailSize, (err, filename) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		}
	})
}

export function removeSystemFiles(list) {
	return list.filter(el => !el.match(/\.DS_Store/));
}