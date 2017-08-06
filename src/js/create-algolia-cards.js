'use strict';

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var algolia = {
	sliced: {
		cards: [] // The data structure we will build
	}
},
    google = {
	cards: null // from G+ API
};

// Grab the generated JSON output from the scrape-gplus script
new Promise(function (resolve, reject) {
	resolve((0, _loadJsonFile2.default)(_config.output.gplus));
}).then(function (collection) {
	google.cards = collection;

	// Grab the metadata which has been manually typed in for each controversy card
	return new Promise(function (resolve, reject) {
		resolve((0, _loadJsonFile2.default)(_config.input.cards));
	});
})

// Compose hardcoded JSON and G+ collection controversy card data
// into a single object, algolia.sliced.cards for sending data to
// Algolia Search: We need slug, name, thumbnail, unique paragraph
// id and paragraph, but for searchable fields, there should be no
// redundancy.  The redundancy should all occur with the metadata.
.then(function (cardsJSON) {
	return new Promise(function (resolve, reject) {
		console.log("\nSeeding Algolia cards index from G+ collection and hardcoded cards.json input ...\n");

		google.cards.forEach(function (gplusCard) {
			// Generate the slug
			var slug = (0, _utils.createSlug)(gplusCard.name);

			console.log('Saving JSON to ' + _config.output.feeds + ': ' + slug);

			// Get the hardcoded JSON data for this card by matching slugs
			var json = cardsJSON.filter(function (el) {
				return el.slug === slug ? true : false;
			})[0],


			// Split and label the text by paragraphs
			splitByParagraph = (0, _utils.splitText)(slug, gplusCard.text, _config.stop.cards),


			// This is the redundant part
			algoliaMetadata = {
				slug: json.slug,
				shortSlug: json['short-slug'],
				gplusUrl: gplusCard.url,
				publishDate: gplusCard.publishDate,
				updateDate: gplusCard.updateDate,
				projectUrl: '', // What is this?!
				metrics: [],
				images: {
					large: {
						// url: cloudfront.cards + slug + '/large.jpg',
						width: json.images.large.width,
						height: json.images.large.height
					},
					thumbnail: {
						url: _config.cloudfront.cards + slug + '/thumbnail.jpg'
					},
					pyramid: {
						// url: cloudfront.cards + slug + '/pyramid_files/',
						maxZoomLevel: json.images.pyramid.maxZoomLevel,
						TileSize: json.images.pyramid.TileSize
					}
				}
			};

			// Save card name one time
			var cardNameJSON = Object.assign({}, { cardName: gplusCard.name }, algoliaMetadata);

			algolia.sliced.cards = algolia.sliced.cards.concat(cardNameJSON);

			// Save card category one time
			var categoryJSON = Object.assign({}, { cardCategory: gplusCard.category }, algoliaMetadata);

			algolia.sliced.cards = algolia.sliced.cards.concat(categoryJSON);

			// Save card summary one time
			var summaryJSON = Object.assign({}, { cardSummary: gplusCard.summary }, algoliaMetadata);

			algolia.sliced.cards = algolia.sliced.cards.concat(summaryJSON);

			// Save all paragraphs for card just one time
			var smallerChunkJSON = splitByParagraph.map(function (paragraphJSON) {
				return Object.assign({}, { id: paragraphJSON.id,
					cardParagraph: paragraphJSON.paragraph }, algoliaMetadata);
			});

			algolia.sliced.cards = algolia.sliced.cards.concat(smallerChunkJSON);

			resolve();
		});
	});
})

// Export that composed object to a JSON file, for importing into Algolia search service
.then(function () {
	return new Promise(function (resolve, reject) {
		if (algolia.sliced.cards) {
			console.log('\nExporting the combined JSON to ' + _config.output.cards);

			_fs2.default.writeFile(_config.output.cards, JSON.stringify(algolia.sliced.cards), 'utf-8', function (err) {

				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		} else {
			console.log('\nSkipping the export of the combined JSON because it is empty.\n');
		}
	});
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});