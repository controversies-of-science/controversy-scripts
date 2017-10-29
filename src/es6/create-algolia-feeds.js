import { dir, cloudfront, input, output, stop } from './libs/config';
import { splitText, removeSystemFiles } from './libs/utils';
import frontMatter from 'front-matter';
import pageDown from 'pagedown'; // Markdown processor used by Stack Overflow

import fs from 'fs';
import loadJSONFile from 'load-json-file';

const
	markdownConverter = pageDown.getSanitizingConverter();

let
	algolia = {
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
let promiseArray = dir.md.feeds.map((feedMarkdownDirectory) => {
	return new Promise((resolve, reject) => {
		fs.readdir(feedMarkdownDirectory, (err, files) => {
			files = files.map(file => feedMarkdownDirectory + file);

			if (err) {
				reject(err);
			} else {
				// Save the filenames
				algolia.feed.markdowns = algolia.feed.markdowns.concat(files);
				resolve();
			}
		})
	});
});

Promise.all(promiseArray)

// Fetch all feed posts from local file structure
.then(() => {
	console.log('\nFetching from local directories all feed posts ...\n');

	algolia.feed.markdowns = removeSystemFiles(algolia.feed.markdowns);

	let feedMarkdownCount = 0;

	return new Promise((resolve, reject) => {
		let syncMarkdown = function() {
			fs.readdir(algolia.feed.markdowns[feedMarkdownCount],
				(readdir_err, files) => {

				if (readdir_err) {
					reject(readdir_err);
				}

				console.log('Fetching post for ' +
					algolia.feed.markdowns[feedMarkdownCount]);

				fs.readFile(algolia.feed.markdowns[feedMarkdownCount] +
					'/_index.md',
					'utf8',
					(err, feedPost) => {

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
		}

		syncMarkdown();
	});		
})

// Grab the metadata which has been manually typed in for the example Halton
// Arp feed posts
.then(() => {
	return new Promise((resolve, reject) => {
		resolve(loadJSONFile(input.feeds));		
	});
})

// Process the hard-coded feed front-matter and markdown into HTML and JSON
.then((postsJSON) => {
	console.log('\nConverting all markdown into HTML ...');

	let promiseArray = algolia.feed.posts.map((post, postCount) => {
		return new Promise((resolve, reject) => {
			let feedPostObject = frontMatter(post),
				longSlug = algolia.feed.markdowns[postCount].split('/'),
				slug = longSlug[longSlug.length-1],
				feedPostAttributes = feedPostObject.attributes,
				feedPostHTML = markdownConverter.makeHtml(feedPostObject.body),
				inputFeedsJSON = [];

			postsJSON.forEach(post => {
				inputFeedsJSON.push(post);
			});

			let json = inputFeedsJSON.filter((el) => el.slug === slug ?
				true :
				false)[0];

			if (!json) {
				reject('It is quite likely that there is a mismatch between directory structure in /md and /img directories.  It appears that the problem relates to feed post ' + slug + '\n');
			}

			let
				feedPostParagraphs = splitText(slug, feedPostHTML, stop.feeds),
				algoliaFeedPost = [],

				algoliaMetadata = {
					sortBy: feedPostAttributes.title,
					facetCategory: 'Feed Posts',
					facetSubCategory: 'person', // TODO
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
							url: cloudfront.feeds + feedPostAttributes.discourse_level +
								'/' + slug + '/thumbnail.jpg'
						},
						pyramid: {
							// url: cloudfront.feeds + feedPostAttributes.discourse_level +
								// '/' + slug + '/pyramid_files/',
							maxZoomLevel: json.images.pyramid.maxZoomLevel,
							TileSize: json.images.pyramid.TileSize
						}
					}
				};

			algolia.sliced.feeds = algolia.sliced.feeds.concat(Object.assign({},
				{ postName: feedPostAttributes.title, recordType: 'postName' },
				algoliaMetadata
			));

			feedPostParagraphs.forEach(paragraph => {
				algoliaFeedPost.push(Object.assign({},
					{ id: paragraph.id, recordType: 'postParagraph' },
					algoliaMetadata,
					{ postParagraph: paragraph.paragraph }))
			});

			algolia.sliced.feeds = algolia.sliced.feeds.concat(algoliaFeedPost);
			resolve();
		});
	});

	return Promise.all(promiseArray);
})

// Export that composed object to a JSON file, for importing into Algolia search service
.then(() => {
	return new Promise((resolve, reject) => {
		if (algolia.sliced.feeds) {
			console.log('\nExporting the feeds JSON to ' + output.feeds);

			fs.writeFile(output.feeds,
				JSON.stringify(algolia.sliced.feeds),
				'utf-8',
				err => {

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
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
