import fs from 'fs';
import Thumbnail from 'thumbnail';
import slugify from 'slugify';
import request from 'request';
import { thumbnailSize } from './config';
// import { execSync } from 'child_process';
import AWS from 'aws-sdk';

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
export function splitText(slug, text, breakString, removeFirstParagraph = false) {
	const allParagraphs = text.split(breakString).map((paragraph, i) => {
		const count = removeFirstParagraph ? i-1 : i;

		return {
			id: slug + '-paragraph-' + count,
			paragraph
		}
	});

	// Notice that we sometimes remove the first paragraph of the text -- which is always
	// the summary. This requires that we also decrement our i counter above when counting
	// out the paragraphs.
	return removeFirstParagraph ?
		allParagraphs.filter((paragraph, num) => num > 0) :
		allParagraphs;
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

// This differs from an 'aws s3 sync' in that it uploads files without
// affecting the rest of the existing s3 bucket.  This function assumes
// that a profile named 'controversy' has already been set for the
// AWS credentials file.  See http://docs.aws.amazon.com/
// sdk-for-javascript/v2/developer-guide/
// loading-node-credentials-shared.html.
export function copyThumbnailToS3(thumbnailPath, bucketID, cardSlug) {
	let s3;

	return new Promise((resolve, reject) => {
		s3 = new AWS.S3();

		resolve(new AWS.SharedIniFileCredentials({
			profile: 'controversy'
		}));
	})

	.then(credentials => {
		AWS.config.credentials = credentials;
		const bucketKey = cardSlug + '/thumbnail.jpg';

		console.log('Copying ' + thumbnailPath + ' to s3://' + bucketID + '/' + bucketKey);

		return new Promise((resolve, reject) => {
			fs.readFile(thumbnailPath, (err, data) => {
				if (err) {
					reject(err);
				}

				const params = {
					Bucket: bucketID,
					Key: bucketKey,
					Body: data
				};

				console.log('bucketID:');
				console.log(bucketID);

				console.log('\nbucketKey:');
				console.log(bucketKey);

				console.log('\nBody:');
				console.log(data);

				s3.upload(params, (err, data) => {
					if (err) {
						console.log(err);
						reject(err);
					} else {
						resolve();
					}
				});
			});
		})
	})

	.catch(error => {
		console.log("\nAn error has occurred ...");

		if (error) {
			console.log(error);
		}
	});
}

// The full array result looks like:
// [ 'https://controversy-cards-images.s3.amazonaws.com/',
  // 'https://',
  // 'controversy-cards-images',
  // '.s3.amazonaws.com/',
  // index: 0,
  // input: 'https://controversy-cards-images.s3.amazonaws.com/' ]
export function getIDFromS3URL(url) {
	const re = /^(https:\/\/)(.+)(\.s3\.amazonaws\.com\/)/;

	return re.exec(url)[2];
}

export function removeSystemFiles(list) {
	return list.filter(el => !el.match(/\.DS_Store/));
}