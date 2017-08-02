import fs from 'fs';
import Thumbnail from 'thumbnail';
import slugify from 'slugify';
import { thumbnailSize } from './config';

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

// Generate thumbnail.jpg from large.jpg for entire directory.  Width is set in
// config.es
export function createThumbnail(input, output, isAlreadyGenerated) {
	return new Promise((resolve, reject) => {
		if (isAlreadyGenerated) {
			console.log('Thumbnail already generated for ' + input);
			resolve();
		} else {
			let thumbnail = new Thumbnail(input, output);

			// null parameter sets height to auto
			thumbnail.ensureThumbnail('large.jpg', thumbnailSize, null, (err, filename) => {

				if (err) {
					reject(err);
				} else {
					// Rename to thumbnail.jpg
					fs.rename(input + '/' + filename, input + '/thumbnail.jpg', () => {
						resolve();
					});
				}
			});
		}
	})
}

export function removeSystemFiles(list) {
	return list.filter(el => !el.match(/\.DS_Store/));
}