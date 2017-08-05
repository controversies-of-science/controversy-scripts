'use strict';

var _cards = require('./libs/cards');

var _cards2 = _interopRequireDefault(_cards);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

var _config = require('./libs/config');

var _utils = require('./libs/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var existingCardCollection = [],
    cardsAPI = void 0,
    jsonCardData = void 0,
    controversies = void 0;

function fetchExistingCards() {
	return new Promise(function (resolve, reject) {
		cardsAPI = new _cards2.default();

		console.log('Fetching the existing collection of cards ...');
		resolve(cardsAPI.getControversySlugs());
	});
}

function deleteExistingCards() {
	var promiseArray = existingCardCollection.map(function (slug) {
		return new Promise(function (resolve, reject) {
			console.log('Deleting controversy card ' + slug);
			resolve(cardsAPI.deleteControversy(slug));
		});
	});

	return Promise.all(promiseArray);
}

function confirmCardDeletion() {
	// Configuration for validation prompt
	var schema = {
		properties: {
			confirmation: {
				pattern: /^(y|n|yes|no)$/,
				description: _safe2.default.red.bold('Do you want to delete the existing collection of controversy cards at the cards API endpoint?'),
				message: _safe2.default.white('(y)es or (n)o'),
				required: true
			}
		}
	};

	_prompt2.default.start();

	// If there is no promise here, the script will continue before
	// getting the answer
	return new Promise(function (resolve, reject) {
		_prompt2.default.get(schema, function (err, result) {
			if (result.confirmation === 'y' || result.confirmation === 'yes') {

				resolve(deleteExistingCards());
			} else {
				resolve();
			}
		});
	});
}

function getScrapedCollection() {
	return new Promise(function (resolve, reject) {
		resolve((0, _loadJsonFile2.default)(_config.output.gplus));
	});
}

// I'm using a recursive promise chain because I would prefer that
// these happen in a predictable order.
function putAllScrapedControversies(controversies) {
	new Promise(function (resolve, reject) {
		var putControversy = function putControversy(count) {
			var card = controversies[count];

			console.log('Saving controversy card ' + card.cardName + ' to card API.');

			// TODO: Add error state
			cardsAPI.createControversy(card.slug, card.cardName, card.cardSummary, card.cardCategory, card.text, card.cardAuthor, card.gplusUrl, card.publishDate, card.updateDate, card.images).then(function (data) {
				console.log(data);

				var next = ++count;

				if (next >= controversies.length) {
					resolve();
				} else {
					putControversy(next);
				}
			}).catch(function (data) {
				console.log('ERROR:');
				console.log(data);

				reject();
			});
		};

		putControversy(0);
	});
}

fetchExistingCards().then(function (slugs) {
	console.log('\nThe current set of cards in the API is:\n');
	console.log(slugs);

	existingCardCollection = slugs;

	if (existingCardCollection.length > 0) {
		return confirmCardDeletion();
	} else {
		return;
	}
}).then(function () {
	console.log('\nNow fetching the G+ collection data from local JSON file ...');

	return getScrapedCollection();
}).then(function (data) {
	jsonCardData = data;

	console.log('\nThere are ' + jsonCardData.length + ' cards in the JSON file. Now constructing our API objects ...');

	controversies = jsonCardData.map(function (card) {
		var slug = (0, _utils.createSlug)(card.name);

		return {
			slug: slug,
			name: card.name,
			summary: card.summary,
			category: card.category,
			text: (0, _utils.splitText)(slug, card.text, _config.stop.cards)
		};
	});

	putAllScrapedControversies(controversies);
}).then(function () {
	console.log('\ndone.');
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});