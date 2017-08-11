'use strict';

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _frontMatter = require('front-matter');

var _frontMatter2 = _interopRequireDefault(_frontMatter);

var _pagedown = require('pagedown');

var _pagedown2 = _interopRequireDefault(_pagedown);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Markdown processor used by Stack Overflow

var markdownConverter = _pagedown2.default.getSanitizingConverter();

var algolia = {
	sliced: {
		feeds: []
	},
	feed: {
		posts: [], // raw feed post content
		images: [], // full local image pathnames
		markdowns: [] // feed post markdown only
	}
};

// Grab all feed post markdown directories based upon local file structure
var promiseArray = _config.dir.md.feeds.map(function (feedMarkdownDirectory) {
	return new Promise(function (resolve, reject) {
		_fs2.default.readdir(feedMarkdownDirectory, function (err, files) {
			files = files.map(function (file) {
				return feedMarkdownDirectory + file;
			});

			if (err) {
				reject(err);
			} else {
				// Save the filenames
				algolia.feed.markdowns = algolia.feed.markdowns.concat(files);
				resolve();
			}
		});
	});
});

Promise.all(promiseArray)

// Fetch all feed posts from local file structure
.then(function () {
	console.log('\nFetching from local directories all feed posts ...\n');

	algolia.feed.markdowns = (0, _utils.removeSystemFiles)(algolia.feed.markdowns);

	var feedMarkdownCount = 0;

	return new Promise(function (resolve, reject) {
		var syncMarkdown = function syncMarkdown() {
			_fs2.default.readdir(algolia.feed.markdowns[feedMarkdownCount], function (readdir_err, files) {

				if (readdir_err) {
					reject(readdir_err);
				}

				console.log('Fetching post for ' + algolia.feed.markdowns[feedMarkdownCount]);

				_fs2.default.readFile(algolia.feed.markdowns[feedMarkdownCount] + '/_index.md', 'utf8', function (err, feedPost) {

					if (err) {
						reject(err);
					} else {
						// Save feed post
						algolia.feed.posts.push(feedPost);
					}

					if (feedMarkdownCount < algolia.feed.markdowns.length) {
						syncMarkdown();
					} else {
						resolve();
					}
				});

				feedMarkdownCount++;
			});
		};

		syncMarkdown();
	});
})

// Grab the metadata which has been manually typed in for the example Halton
// Arp feed posts
.then(function () {
	return new Promise(function (resolve, reject) {
		resolve((0, _loadJsonFile2.default)(_config.input.feeds));
	});
})

// Process the hard-coded feed front-matter and markdown into HTML and JSON
.then(function (postsJSON) {
	console.log('\nConverting all markdown into HTML ...');

	var promiseArray = algolia.feed.posts.map(function (post, postCount) {
		return new Promise(function (resolve, reject) {
			var feedPostObject = (0, _frontMatter2.default)(post),
			    longSlug = algolia.feed.markdowns[postCount].split('/'),
			    slug = longSlug[longSlug.length - 1],
			    feedPostAttributes = feedPostObject.attributes,
			    feedPostHTML = markdownConverter.makeHtml(feedPostObject.body),
			    inputFeedsJSON = [];

			postsJSON.forEach(function (post) {
				inputFeedsJSON.push(post);
			});

			var json = inputFeedsJSON.filter(function (el) {
				return el.slug === slug ? true : false;
			})[0];

			if (!json) {
				reject('It is quite likely that there is a mismatch between directory structure in /md and /img directories.  It appears that the problem relates to feed post ' + slug + '\n');
			}

			var feedPostParagraphs = (0, _utils.splitText)(slug, feedPostHTML, _config.stop.feeds),
			    algoliaFeedPost = [],
			    algoliaMetadata = {
				card: feedPostAttributes.controversy,
				cardSlug: json.card,
				feedSlug: slug,
				discourseLevel: feedPostAttributes.discourse_level,
				authors: feedPostAttributes.authors,
				publishDate: feedPostAttributes.date,
				updateDate: feedPostAttributes.lastmod,
				projectUrl: feedPostAttributes.project_url,
				categories: feedPostAttributes.categories,
				metrics: feedPostAttributes.metrics,
				images: {
					large: {
						// url: cloudfront.feeds + feedPostAttributes.discourse_level +
						// '/' + slug + '/large.jpg',
						width: json.images.large.width,
						height: json.images.large.height
					},
					thumbnail: {
						url: _config.cloudfront.feeds + feedPostAttributes.discourse_level + '/' + slug + '/thumbnail.jpg'
					},
					pyramid: {
						// url: cloudfront.feeds + feedPostAttributes.discourse_level +
						// '/' + slug + '/pyramid_files/',
						maxZoomLevel: json.images.pyramid.maxZoomLevel,
						TileSize: json.images.pyramid.TileSize
					}
				}
			};

			algolia.sliced.feeds = algolia.sliced.feeds.concat(Object.assign({}, { postName: feedPostAttributes.title }, algoliaMetadata));

			feedPostParagraphs.forEach(function (paragraph) {
				algoliaFeedPost.push(Object.assign({}, { id: paragraph.id }, algoliaMetadata, { postParagraph: paragraph.paragraph }));
			});

			algolia.sliced.feeds = algolia.sliced.feeds.concat(algoliaFeedPost);
			resolve();
		});
	});

	return Promise.all(promiseArray);
})

// Export that composed object to a JSON file, for importing into Algolia search service
.then(function () {
	return new Promise(function (resolve, reject) {
		if (algolia.sliced.feeds) {
			console.log('\nExporting the feeds JSON to ' + _config.output.feeds);

			_fs2.default.writeFile(_config.output.feeds, JSON.stringify(algolia.sliced.feeds), 'utf-8', function (err) {

				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		} else {
			console.log('\nSkipping the export of the feeds JSON because it is empty.\n');
		}
	});
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});