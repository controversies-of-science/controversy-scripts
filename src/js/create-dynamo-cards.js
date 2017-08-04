'use strict';

var _cards = require('./libs/cards');

var _cards2 = _interopRequireDefault(_cards);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var existingCardCollection = [],
    cardsAPI = void 0;

async function clearCollection() {
	cardsAPI = new _cards2.default();

	console.log('Fetching the existing collection of cards ...');
	existingCardCollection = await cardsAPI.getControversySlugs();

	console.log('\nThe current set of slugs is:');
	console.log(existingCardCollection);
}

try {
	clearCollection();
} catch (e) {
	console.log(e);
}