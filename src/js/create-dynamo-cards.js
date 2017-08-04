'use strict';

var _cards = require('./libs/cards');

var _cards2 = _interopRequireDefault(_cards);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var existingCardCollection = [],
    cardsAPI = void 0;

async function clearCollection() {
	cardsAPI = new _cards2.default();

	console.log('Fetching the existing collection of cards ...');
	existingCardCollection = await cardsAPI.getControversySlugs();

	console.log('\nThe current set of cards is:');
	console.log(existingCardCollection);

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

	_prompt2.default.get(schema, function (err, result) {
		if (result.confirmation === 'y' || result.confirmation === 'yes') {

			existingCardCollection.forEach(function (slug) {
				console.log('\nDeleting controversy card ' + slug);
				cardsAPI.deleteControversy(slug);
			});
		}
	});
}

try {
	clearCollection();
} catch (e) {
	console.log(e);
}