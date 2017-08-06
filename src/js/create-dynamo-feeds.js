'use strict';

var _feeds = require('./libs/feeds');

var _feeds2 = _interopRequireDefault(_feeds);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

var _frontMatter = require('front-matter');

var _frontMatter2 = _interopRequireDefault(_frontMatter);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _pagedown = require('pagedown');

var _pagedown2 = _interopRequireDefault(_pagedown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Markdown processor used by Stack Overflow

var markdownConverter = _pagedown2.default.getSanitizingConverter();

var dynamo = {
	feed: {
		data: [], // local JSON post metadata
		posts: [], // raw markdown
		directories: [],
		json: [] // final processed aggregated JSON
	}
};

var existingFeedCollection = [],
    feedsAPI = void 0,
    feeds = void 0;

// Hardcoding for now the Halton Arp card slug
function fetchExistingFeeds() {
	return new Promise(function (resolve, reject) {
		feedsAPI = new _feeds2.default();

		console.log('Fetching the existing collection of cards ...');
		resolve(feedsAPI.getFeedSlugs('halton-arp'));
	});
}

function fetchAllFeedMarkdownDirectories() {
	var promiseArray = _config.dir.md.feeds.map(function (feedImageDirectory) {
		return new Promise(function (resolve, reject) {
			_fs2.default.readdir(feedImageDirectory, function (err, files) {
				files = files.map(function (file) {
					return feedImageDirectory + file;
				});

				if (err) {
					reject(err);
				} else {
					dynamo.feed.directories = dynamo.feed.directories.concat((0, _utils.removeSystemFiles)(files));
					resolve();
				}
			});
		});
	});

	return Promise.all(promiseArray);
}

function fetchFeedPosts() {
	console.log('\nFetching the local feed markdowns from these feeds markdown directories ...\n');

	var feedPostCount = 0;

	return new Promise(function (resolve, reject) {
		var syncFeedPost = function syncFeedPost() {
			_fs2.default.readdir(dynamo.feed.directories[feedPostCount], function (readdir_err, files) {

				if (readdir_err) {
					reject(readdir_err);
				}

				console.log('Fetching post for ' + dynamo.feed.directories[feedPostCount]);

				_fs2.default.readFile(dynamo.feed.directories[feedPostCount] + '/_index.md', 'utf8', function (err, feedPost) {

					if (err) {
						reject(err);
					} else {
						dynamo.feed.posts.push(feedPost);
					}

					if (feedPostCount < dynamo.feed.directories.length - 1) {

						++feedPostCount;
						syncFeedPost();
					} else {
						resolve();
					}
				});
			});
		};

		syncFeedPost();
	});
}

function deleteExistingFeeds(cardSlug) {
	console.log('');

	var promiseArray = existingFeedCollection.map(function (feedSlug) {
		return new Promise(function (resolve, reject) {
			console.log('Deleting controversy card feed for ' + cardSlug + ': ' + feedSlug);

			resolve(feedsAPI.deleteFeed(cardSlug, feedSlug));
		});
	});

	return Promise.all(promiseArray);
}

function confirmFeedDeletion() {
	// Configuration for validation prompt
	var schema = {
		properties: {
			confirmation: {
				pattern: /^(y|n|yes|no)$/,
				description: _safe2.default.red.bold('Do you want to delete the existing collection of controversy card feeds at the feeds API endpoint?'),
				message: _safe2.default.white('(y)es or (n)o'),
				required: true
			}
		}
	};

	_prompt2.default.start();

	// If there is no promise here, the script will continue before
	// getting the answer
	return new Promise(function (resolve, reject) {
		console.log('');

		_prompt2.default.get(schema, function (err, result) {
			if (result.confirmation === 'y' || result.confirmation === 'yes') {

				resolve(deleteExistingFeeds('halton-arp'));
			} else {
				resolve();
			}
		});
	});
}

function getLocalFeedJSON() {
	return new Promise(function (resolve, reject) {
		resolve((0, _loadJsonFile2.default)(_config.input.feeds));
	});
}

function processFeedPosts() {
	console.log('\nConverting all markdown into HTML ...\n');

	console.log('number of dynamo feed posts');
	console.log(dynamo.feed.posts.length);

	// let promiseArray = dynamo.feed.posts.map((post, postCount) => {
	new Promise(function (resolve, reject) {
		var processPost = function processPost(postCount) {
			var feedPostObject = (0, _frontMatter2.default)(dynamo.feed.posts[postCount]),
			    longSlug = dynamo.feed.directories[postCount].split('/');

			var slug = longSlug[longSlug.length - 1],
			    feedPostAttributes = feedPostObject.attributes,
			    feedPostHTML = markdownConverter.makeHtml(feedPostObject.body);

			var json = dynamo.feed.data.filter(function (el) {
				return el.slug === slug ? true : false;
			})[0];

			if (!json) {
				reject('It is quite likely that there is a mismatch between directory structure in /md and /img directories.  It appears that the problem relates to feed post ' + slug + '\n');
			}

			if (!feedPostAttributes.controversy) {
				console.log('Markdown missing controversy attributes:');

				console.log(feedPostAttributes);
			}

			var feedPostParagraphs = (0, _utils.splitText)(slug, feedPostHTML, _config.stop.feeds),
			    dynamoItem = {
				cardSlug: (0, _utils.createSlug)(feedPostAttributes.controversy),
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
						url: _config.url.feeds + feedPostAttributes.discourse_level + '/' + slug + '/thumbnail.jpg'
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
		};

		processPost(0);
	});
}

// I'm using a recursive promise chain because I would prefer that
// these happen in a predictable order.
function postAllScrapedFeeds(feeds) {
	console.log('\nNow saving controversy card feed posts to feeds API ...\n');

	new Promise(function (resolve, reject) {
		var putFeed = function putFeed(count) {
			var feed = dynamo.feed.json[count],
			    slug = feed.feedSlug,
			    localFeedHash = {};

			// Create a hash map for easier referencing
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = dynamo.feed.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var feedData = _step.value;

					localFeedHash[slug] = {
						cardSlug: feedData['card'],
						images: feedData['images'],
						discourseLevel: feedData['level']
					};
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			console.log(count + ': Saving controversy card feed for ' + feed.cardSlug + ' to feed API: ' + feed.feedName);

			// TODO: Add error state
			feedsAPI.createFeed(localFeedHash[slug]['cardSlug'], slug, feed.feedName, feed.feedCategories, feed.text, feed.feedAuthors, localFeedHash[slug]['images'], localFeedHash[slug]['discourseLevel'], feed.publishDate, feed.updateDate).then(function (data) {
				var next = ++count;

				if (next >= dynamo.feed.json.length) {
					resolve();
				} else {
					putFeed(next);
				}
			}).catch(function (data) {
				console.log('ERROR:');
				console.log(data);

				reject();
			});
		};

		putFeed(0);
	});
}

fetchExistingFeeds().then(function (slugs) {
	console.log('\nThe current set of feeds in the API is:\n');
	console.log(slugs);

	existingFeedCollection = slugs;

	if (existingFeedCollection.length > 0) {
		return confirmFeedDeletion();
	} else {
		return;
	}
}).then(function () {
	return fetchAllFeedMarkdownDirectories();
}).then(function () {
	console.log('\nThe list of feed directories ...\n');
	console.log(dynamo.feed.directories);

	// this sets dynamo.feed.posts
	return new Promise(function (resolve, reject) {
		resolve(fetchFeedPosts());
	});
}).then(function () {
	return getLocalFeedJSON();
}).then(function (data) {
	dynamo.feed.data = data;

	return processFeedPosts();
}).then(function () {
	postAllScrapedFeeds();
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});