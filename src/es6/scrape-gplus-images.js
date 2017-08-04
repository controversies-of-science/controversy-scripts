import loadJSONFile from 'load-json-file';
import fs from 'fs';
import { output, dir } from './libs/config';
import { createSlug, saveImage } from './libs/utils';

// Get the controversy cards data from disk 
new Promise((resolve, reject) => {
	resolve(loadJSONFile(output.gplus));		
})

.then(cards => {
	console.log('\nSaving large-format controversy card images based upon the G+ Controversies of Science collection in '
		+ dir.images.cards + '. Be aware that the G+ API does not always provide the correct URL for these large-format images.  I STRONGLY recommend that you check the dimensions for all of them once they are downloaded.');

	let promiseArray = cards.map(card => {
		return new Promise((resolve, reject) => {

			let slug = createSlug(card.name),
				imageDirectory = dir.images.cards + slug;

			// Check if we have read/write access to the directory
			fs.access(imageDirectory, fs.constants.R_OK | fs.constants.W_OK,
				access_err => {

				// Slug-named directory does not exist
				if (access_err) {
					console.log('\nThe image directory ' + imageDirectory +
						' does not exist. Please run the scrape-gplus-directories script first.\n');

					reject();

				// Directory exists, save large-format image file ...
				} else {
					console.log('Saving image for ' + imageDirectory);

					saveImage(card.image, imageDirectory + '/large.jpg',
						resolve, reject);
				}
			});
		});
	});

	return Promise.all(promiseArray);
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
