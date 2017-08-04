import Cards from './libs/cards';

let existingCardCollection = [],
	cardsAPI;

async function clearCollection() {
	cardsAPI = new Cards();

	console.log('Fetching the existing collection of cards ...');
	existingCardCollection = await cardsAPI.getControversySlugs();

	console.log('\nThe current set of slugs is:')
	console.log(existingCardCollection);
}

try {
	clearCollection();
}
catch(e) {
	console.log(e);
}
