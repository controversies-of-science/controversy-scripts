import { removeSystemFiles, copyThumbnailToS3, getIDFromS3URL } from './libs/utils';
import { url, dir } from './libs/config';
import fs from 'fs';

let cardBucketID,
	cardThumbnailList = [];

function fetchCardThumbnailList() {
	return new Promise((resolve, reject) => {
		fs.readdir(dir.images.cards, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(removeSystemFiles(files));
			}
		})	
	});
}

function getSlugFromPath(path) {
	const pathParts = path.split('/');
	return pathParts[pathParts.length-1];
}

// TODO: Debug one-off error where the first upload fails
function copyCardThumbnails() {
	return new Promise((resolve, reject) => {
		const
			total = cardThumbnailList.length;

		let copy = (count) => {
			const
				thumbnailPath = cardThumbnailList[count],
				cardSlug = getSlugFromPath(thumbnailPath);

			copyThumbnailToS3(thumbnailPath + '/thumbnail.jpg', cardBucketID, cardSlug)

				.then(() => {
					++count;

					if (count === total) {
						resolve();
					} else {
						copy(count);
					}
				});
		}

		copy(0);
	});
}

fetchCardThumbnailList()

.then(files => {
	cardThumbnailList = files.map(file => dir.images.cards + file);
	cardBucketID = getIDFromS3URL(url.cards);

	return copyCardThumbnails();
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
