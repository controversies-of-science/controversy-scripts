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

async function clearCollection() {
	cardsAPI = new _cards2.default();

	console.log('Fetching the existing collection of cards ...');
	existingCardCollection = await cardsAPI.getControversySlugs();

	console.log('\nThe current set of cards is:');
	console.log(existingCardCollection);

	// Configuration for validation prompt
	var schema = {
		properties: {
			confirmation: {
				pattern: /^(y|n|yes|no)$/,
				description: _safe2.default.red.bold('Are you sure you want to delete the existing collection of controversy cards?'),
				message: _safe2.default.white('(y)es or (n)o'),
				required: true
			}
		}
	};

	_prompt2.default.start();

	_prompt2.default.get(schema, async function (err, result) {
		if (result.confirmation === 'y' || result.confirmation === 'yes') {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {

				for (var _iterator = existingCardCollection[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var slug = _step.value;

					console.log('\nDeleting controversy card ' + slug);
					await cardsAPI.deleteControversy(slug);
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
		} else {
			return;
		}
	});

	return;
}

async function getScrapedCollection() {
	return await (0, _loadJsonFile2.default)(_config.output.gplus);
}

async function putAllScrapedControversies(controversies) {
	controversies.forEach(function (controversy) {
		console.log(controversy);
		console.log('');
	});
}

async function main() {
	try {
		await clearCollection();
		jsonCardData = await getScrapedCollection();

		controversies = jsonCardData.map(function (card) {
			return {
				slug: (0, _utils.createSlug)(card.name),
				name: card.name,
				summary: card.summary,
				category: card.category,
				text: (0, _utils.splitText)(card.text)
			};
		});

		putAllScrapedControversies(controversies);
	} catch (e) {
		console.log(e);
	}
}

main();