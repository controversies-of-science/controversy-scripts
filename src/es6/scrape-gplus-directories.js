import loadJSONFile from 'load-json-file';
import fs from 'fs';
import { output, dir } from './libs/config';
import { createSlug } from './libs/utils';

// Check if we have read/write access on the top-level cards directory
new Promise((resolve, reject) => {
	console.log('\nChecking that the ' + dir.images.cards +
		' directory already exists.  If it doesn\'t, will generate ...');

	fs.access(dir.images.cards, fs.constants.R_OK | fs.constants.W_OK,
		access_err => {

		// Does not yet exist, create it
		if (access_err) {
			console.log('\nCards directory does not exist, creating it ...');

			fs.mkdir(dir.images.cards, (mkdir_err, folder) => {
				if (mkdir_err) {
					reject(mkdir_err);
				} else {
					resolve();
				}
			});

		// Directory already exists
		} else {
			console.log('\nCards directory already exists ...');

			resolve();
		}
	})
})

// Get the controversy cards data from disk 
.then(() => {
	return new Promise((resolve, reject) => {
		resolve(loadJSONFile(output.gplus));		
	});
})

.then(cards => {
	console.log('\nCreating controversy card directories based upon the G+ Controversies of Science collection in '
		+ dir.images.cards + '.  Directories which already exist will be ignored ...\n');

	let promiseArray = cards.map(card => {
		return new Promise((resolve, reject) => {

			let slug = createSlug(card.name),
				imageDirectory = dir.images.cards + slug;

			// Check if we have read/write access to the directory
			fs.access(imageDirectory, fs.constants.R_OK | fs.constants.W_OK,
				access_err => {

				// Slug-named directory does not exist
				if (access_err) {
					console.log('Creating directory ' + imageDirectory);

					fs.mkdir(imageDirectory, (mkdir_err, folder) => {
						if (mkdir_err) {
							reject(mkdir_err);
						} else {
							resolve();
						}
					});

				// Directory exists ...
				} else {
					console.log('Skipping creation of directory ' + imageDirectory);

					resolve();
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
