import loadJSONFile from 'load-json-file';
import fs from 'fs';
import { output, dir, url } from './libs/config';
import { createSlug, saveImage } from './libs/utils';

// Get the controversy cards data from disk 
new Promise((resolve, reject) => {
	resolve(loadJSONFile(output.gplus));		
})

.then(cards => {
	console.log('\nSaving large-format controversy card images based upon the G+ Controversies of Science collection in '
		+ dir.images.cards + '. Be aware that since the G+ API does not always provide the correct URL for these large-format images, I am instead pulling these from my own AWS S3 bucket.');

	let promiseArray = cards.map(card => {
		return new Promise((resolve, reject) => {

			let slug = createSlug(card.name),
				imageDirectory = dir.images.cards + slug,
				imageUrl = url.cards + slug + '/large.jpg';

			// Check if we have read/write access to the directory
			fs.access(imageDirectory, fs.constants.R_OK | fs.constants.W_OK,
				access_err => {

				// Slug-named directory does not exist
				if (access_err) {
					console.log('The image directory ' + imageDirectory +
						' does not exist. Please run the scrape-gplus-directories script first.');

					reject();

				// Directory exists, save large-format image file ...
				} else {
					console.log('Saving image for ' + imageDirectory);

					saveImage(imageUrl, imageDirectory + '/large.jpg',
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
