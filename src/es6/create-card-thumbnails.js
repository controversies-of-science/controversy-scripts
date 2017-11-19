import { thumbnailSize, dir } from './libs/config';
import { createThumbnail, removeSystemFiles } from './libs/utils';

import fs from 'fs';

let
	algolia = {
		card: {
			images: [], // full local image pathnames
		}
	};

// grab all controversy card image directories
new Promise((resolve, reject) => {
	fs.readdir(dir.images.cards, (err, files) => {
		if (err) {
			reject(err);
		} else {
			const fullPathFilenames = files.map(filename =>
				dir.images.cards + filename);
			resolve(fullPathFilenames);
		}
	})	
})

// Generate thumbnails for the card posts
.then((cardImageDirectories) => {
	console.log('\nGenerating thumbnails from card posts ...\n');

	algolia.card.images = removeSystemFiles(cardImageDirectories);
	let cardCount = 0;

	return new Promise((resolve, reject) => {
		let syncThumbnail = function() {
			fs.readdir(algolia.card.images[cardCount], (readdir_err, files) => {

				if (readdir_err) {
					reject(readdir_err);
				}

				// createThumbnail(input, output, isAlreadyGenerated)
				createThumbnail(algolia.card.images[cardCount],
					algolia.card.images[cardCount],
					files.includes('thumbnail.jpg'))

				.then(() => {
					if (!files.includes('thumbnail.jpg')) {
						console.log('Thumbnail generated for ' +
							algolia.card.images[cardCount]);
					}

					if (cardCount < algolia.card.images.length-1) {
						++cardCount;
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
