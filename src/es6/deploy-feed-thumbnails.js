import { removeSystemFiles, copyThumbnailToS3, getIDFromS3URL } from './libs/utils';
import { url, dir } from './libs/config';
import fs from 'fs';

let feedBucketID,
	feedThumbnailList = [];

function fetchFeedThumbnailList() {
	return new Promise((resolve, reject) => {

		let fetchFeedDirectory = (count) => {
			fs.readdir(dir.images.feeds[count],
				(err, files) => {

				if (err) {
					reject(err);
				}

				if (count < dir.images.feeds.length-1) {
					const
						fileList = removeSystemFiles(files),
						fullPathFileList = fileList.map(slug => dir.images.feeds[count] + slug);

					feedThumbnailList.push(...fullPathFileList);

					++count;
					fetchFeedDirectory(count);
				} else {
					resolve();
				}
			})
		}

		fetchFeedDirectory(0);
	});
}

function getSlugFromPath(path) {
	const pathParts = path.split('/');
	return pathParts[pathParts.length-1];
}

function getLevelFromPath(path) {
	const pathParts = path.split('/');
	return pathParts[pathParts.length-2];
}

// TODO: Debug one-off error where the first upload fails
function copyFeedThumbnails() {
	return new Promise((resolve, reject) => {
		const
			totalFeeds = feedThumbnailList.length;

		let copyFeed = (feedCount) => {
			const
				feedPath = feedThumbnailList[feedCount];

			const	
				feedSlug = getSlugFromPath(feedPath),
				discourseLevel = getLevelFromPath(feedPath);

			copyThumbnailToS3(
				feedPath + '/thumbnail.jpg',
				feedBucketID,
				'halton-arp-the-modern-galileo/' + discourseLevel + '/' + feedSlug

				).then(() => {
					++feedCount;

					if (feedCount === totalFeeds) {
						resolve();
					} else {
						copyFeed(feedCount);
					}
				});
		}

		copyFeed(0);
	});
}

fetchFeedThumbnailList()

.then(() => {
	feedBucketID = getIDFromS3URL(url.feeds);

	return copyFeedThumbnails();
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
