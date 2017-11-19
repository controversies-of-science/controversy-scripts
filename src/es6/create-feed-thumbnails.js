import { thumbnailSize, thumbnailFilename, dir } from './libs/config';
import { createThumbnail, removeSystemFiles } from './libs/utils';

import fs from 'fs';

let
	algolia = {
		feed: {
			images: [], // full local image pathnames
		}
	};

// grab all controversy feed image directories
new Promise((resolve, reject) => {
	let fullPathFilenames = [],
		layerCount = 0;

	dir.images.feeds.forEach(feedLayer => {
		fs.readdir(feedLayer, (err, files) => {
			if (err) {
				reject(err);
			} else {
				const filenames = files.map(filename =>
					feedLayer + filename);

				fullPathFilenames.push(...filenames);

				 // Always 5 layers of discourse
				if (layerCount === 4) {
					resolve(fullPathFilenames);
				}

				++layerCount;
			}
		})
	});
})

// Generate thumbnails for the feed posts
.then((feedImageDirectories) => {
	console.log('\nGenerating thumbnails from feed posts ...\n');

	algolia.feed.images = removeSystemFiles(feedImageDirectories);
	let feedCount = 0;

	return new Promise((resolve, reject) => {
		let syncThumbnail = function() {
			fs.readdir(algolia.feed.images[feedCount], (readdir_err, files) => {

				if (readdir_err) {
					reject(readdir_err);
				}

				// createThumbnail(input, output, isAlreadyGenerated)
				createThumbnail(algolia.feed.images[feedCount],
					algolia.feed.images[feedCount],
					files.includes(thumbnailFilename))

				.then(() => {
					if (!files.includes(thumbnailFilename)) {
						console.log('Thumbnail generated for ' + algolia.feed.images[feedCount]);
					}

					if (feedCount < algolia.feed.images.length-1) {
						++feedCount;
						syncThumbnail();
					} else {
						resolve();
					}
				})
				.catch((err) => {
					reject(err);
				});				
			});	
		}

		syncThumbnail();
	});
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
