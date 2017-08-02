import { thumbnailSize, dir, url, input, output, stop } from './libs/config';
import { createSlug, saveImage, splitText, createThumbnail, removeSystemFiles } from './libs/utils';

import fs from 'fs';
import request from 'request';
import { execSync } from 'child_process';
import loadJSONFile from 'load-json-file';
import frontMatter from 'front-matter';
import pageDown from 'pagedown'; // Markdown processor used by Stack Overflow

const
	GPlus = require('./libs/gplus').default,
	markdownConverter = pageDown.getSanitizingConverter();

let gplusKeysExist = false;

function scrapeCollection(resolve, reject) {
	console.log('\nSynchronizing backend with Google Plus collection ...');

	let gplus = new GPlus();
	gplus.init();

	// Recursive promise chain to deal with API pagination
	// GPlus class handles aggregation of data
	let getPage = function() {
		gplus.scrapeCards().then(
			data => {
				// Send back an array of the card titles which have been added
				if (gplus.nextPageToken && gplus.more) {
					getPage();
				} else {
					console.log('\nScrape Results:\n');
					console.log([...gplus.titlesAdded]);

					resolve(gplus.getCollection());
				}
			}
		)
		.catch((data) => {
			console.log("\nAlthough keys do indeed exist to access the G+ API, either the keys are invalid or the request has failed. If you wish to proceed without scraping the G+ API, consider removing the keys from your environment variables.");
			console.log("Status Code: " + data.statusCode);
			console.log("Error: " + data.error);

			reject();
		});
	}

	getPage();
}

new Promise((resolve, reject) => {
	console.log("\nChecking for Google+ API Keys in local environment.");
	gplusKeysExist = GPlus.keysExist();

	if (!gplusKeysExist) {
		console.log("\nNo keys found, will not scrape metadata.");

		resolve(null);
	} else {
		console.log("\nScraping G+ Collection.");

		scrapeCollection(resolve, reject);
	}
})

// Save the result to disk
.then(collection => {
	new Promise((resolve, reject) => {
		fs.writeFile(output.gplus,
			JSON.stringify(collection),
			'utf-8',
			(err) => {

			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
