import Feeds from './libs/feeds';
import prompt from 'prompt';
import colors from 'colors/safe';
import frontMatter from 'front-matter';
import fs from 'fs';
import loadJSONFile from 'load-json-file';
import { input, output, stop, api, dir, url } from './libs/config';
import { createSlug, splitText, removeSystemFiles } from './libs/utils';
import pageDown from 'pagedown'; // Markdown processor used by Stack Overflow

const markdownConverter = pageDown.getSanitizingConverter();

let dynamo = {
	feed: {
		data: [], // local JSON post metadata
		posts: [], // raw markdown
		directories: [],
		json: [] // final processed aggregated JSON
	}
}

let existingFeedCollection = [],
	feedsAPI,
	feeds;

// Hardcoding for now the Halton Arp card slug
function fetchExistingFeeds() {
	return new Promise((resolve, reject) => {
		feedsAPI = new Feeds();

		console.log('Fetching the existing collection of cards ...');
		resolve(feedsAPI.getFeedSlugs('halton-arp-the-modern-galileo'));
	});
}

function fetchAllFeedMarkdownDirectories() {
	let promiseArray = dir.md.feeds.map((feedImageDirectory) => {
		return new Promise((resolve, reject) => {
			fs.readdir(feedImageDirectory, (err, files) => {
				files = files.map(file => feedImageDirectory + file);

				if (err) {
					reject(err);
				} else {
					dynamo.feed.directories =
						dynamo.feed.directories.concat(removeSystemFiles(files));
					resolve();
				}
			})
		});
	});

	return Promise.all(promiseArray);
}

function fetchFeedPosts() {
	console.log('\nFetching the local feed markdowns from these feeds markdown directories ...\n');

	let feedPostCount = 0;

	return new Promise((resolve, reject) => {
		let syncFeedPost = function() {
			fs.readdir(dynamo.feed.directories[feedPostCount],
				(readdir_err, files) => {

				if (readdir_err) {
					reject(readdir_err);
				}

				console.log('Fetching post for ' +
					dynamo.feed.directories[feedPostCount]);

				fs.readFile(dynamo.feed.directories[feedPostCount] +
					'/_index.md', 'utf8', (err, feedPost) => {

					if (err) {
						reject(err);
					} else {
						dynamo.feed.posts.push(feedPost);
					}

					if (feedPostCount < dynamo.feed.directories.length-1) {

						++feedPostCount;
						syncFeedPost();
					} else {
						resolve();
					}
				});				
			});	
		}

		syncFeedPost();
	});
}

function deleteExistingFeeds(cardSlug) {
	console.log('');

	let promiseArray = existingFeedCollection.map(feedSlug => {
		return new Promise((resolve, reject) => {
			console.log('Deleting controversy card feed for ' + cardSlug +
				': ' + feedSlug);

			resolve(feedsAPI.deleteFeed(cardSlug, feedSlug));
		});
	});

	return Promise.all(promiseArray);
}

function confirmFeedDeletion() {
	// Configuration for validation prompt
	const schema = {
		properties: {
			confirmation: {
				pattern: /^(y|n|yes|no)$/,
				description: colors.red.bold('Do you want to delete the existing collection of controversy card feeds at the feeds API endpoint?'),
				message: colors.white('(y)es or (n)o'),
				required: true
			}
		}
	};

	prompt.start();

	// If there is no promise here, the script will continue before
	// getting the answer
	return new Promise((resolve, reject) => {
		console.log('');

		prompt.get(schema, (err, result) => {
			if (result.confirmation === 'y' ||
				result.confirmation === 'yes') {

				resolve(deleteExistingFeeds('halton-arp-the-modern-galileo'));
			} else {
				resolve();
			}
		});
	});
}

function getLocalFeedJSON() {
	return new Promise((resolve, reject) => {
		resolve(loadJSONFile(input.feeds));
	});
}

function processFeedPosts() {
	console.log('\nConverting all markdown into HTML ...\n');

	console.log('number of dynamo feed posts');
	console.log(dynamo.feed.posts.length);

	// let promiseArray = dynamo.feed.posts.map((post, postCount) => {
	new Promise((resolve, reject) => {
		let processPost = function(postCount) {
			let feedPostObject = frontMatter(dynamo.feed.posts[postCount]),
				longSlug = dynamo.feed.directories[postCount].split('/');

			let slug = longSlug[longSlug.length-1],
				feedPostAttributes = feedPostObject.attributes,
				feedPostHTML = markdownConverter.makeHtml(feedPostObject.body);

			let json = dynamo.feed.data.filter(el =>
				el.slug === slug ?
				true :
				false)[0];

			if (!json) {
				reject('It is quite likely that there is a mismatch between directory structure in /md and /img directories.  It appears that the problem relates to feed post ' + slug + '\n');
			}

			if (!feedPostAttributes.controversy) {
				console.log('Markdown missing controversy attributes:');

				console.log(feedPostAttributes);
			}

			let
				feedPostParagraphs = splitText(slug, feedPostHTML, stop.feeds),

				dynamoItem = {
					cardSlug: createSlug(feedPostAttributes.controversy),
					feedSlug: slug,
					feedName: feedPostAttributes.title,
					feedCategories: feedPostAttributes.categories,
					text: feedPostParagraphs,
					feedAuthors: feedPostAttributes.authors,
					images: {
						large: {
							// url: url.feeds + feedPostAttributes.discourse_level
							// + '/' + slug + '/large.jpg',
							width: json.images.large.width,
							height: json.images.large.height
						},
						thumbnail: {
							url: url.feeds + feedPostAttributes.discourse_level +
								'/' + slug + '/thumbnail.jpg'
						},
						pyramid: {
							// url: url.feeds + feedPostAttributes.discourse_level +
							// '/' + slug + '/pyramid_files/',
							maxZoomLevel: json.images.pyramid.maxZoomLevel,
							TileSize: json.images.pyramid.TileSize
						}
					},
					discourseLevel: feedPostAttributes.discourse_level,
					publishDate: feedPostAttributes.date,
					updateDate: feedPostAttributes.lastmod
				};

			dynamo.feed.json = dynamo.feed.json.concat(dynamoItem);

			++postCount;
			if (postCount >= dynamo.feed.posts.length) {
				resolve();
			} else {
				processPost(postCount);
			}
		}

		processPost(0);
	});
}

// I'm using a recursive promise chain because I would prefer that
// these happen in a predictable order.
function postAllScrapedFeeds(feeds) {
	console.log('\nNow saving controversy card feed posts to feeds API ...\n');

	const localFeedHash = {};

	// Create a hash map for easier referencing.  There was a bug here, but
	// I believe that I've fixed it ...
	for (let feedData of dynamo.feed.data) {
		localFeedHash[feedData['slug']] = {
			cardSlug: feedData['card'],
			images: feedData['images'],
			discourseLevel: feedData['level']
		}
	}

	new Promise((resolve, reject) => {
		let putFeed = function(count) {
			const
				feed = dynamo.feed.json[count],
				slug = feed.feedSlug;

			console.log(count + ': Saving controversy card feed for ' +
				feed.cardSlug + ' to feed API: ' + feed.feedName);

			feedsAPI.createFeed(
				feed.cardSlug,
				slug,
				feed.feedName,
				feed.feedCategories,
				feed.text,
				feed.feedAuthors,
				localFeedHash[slug]['images'],
				localFeedHash[slug]['discourseLevel'],
				feed.publishDate,
				feed.updateDate)

				.then(data => {
					const next = ++count;

					if (next >= dynamo.feed.json.length) {
						resolve();
					} else {
						putFeed(next);
					}
				}).catch(data => {
					console.log('ERROR:');
					console.log(data);

					reject();
				});
		}

		putFeed(0);
	});
}

fetchExistingFeeds()

.then(slugs => {
	console.log('\nThe current set of feeds in the API is:\n')
	console.log(slugs);

	existingFeedCollection = slugs;

	if (existingFeedCollection.length > 0) {
		return confirmFeedDeletion();
	} else {
		return;
	}
})

.then(() => {
	return fetchAllFeedMarkdownDirectories();	
})

.then(() => {
	console.log('\nThe list of feed directories ...\n');
	console.log(dynamo.feed.directories);

	// this sets dynamo.feed.posts
	return new Promise((resolve, reject) => {
		resolve(fetchFeedPosts());
	});
})

.then(() => {
	return getLocalFeedJSON();
})

.then((data) => {
	dynamo.feed.data = data;

	return processFeedPosts();
})

.then(() => {
	postAllScrapedFeeds();
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
