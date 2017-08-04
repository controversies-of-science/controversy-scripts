import Cards from './libs/cards';
import prompt from 'prompt';
import colors from 'colors/safe';

let existingCardCollection = [],
	cardsAPI;

async function clearCollection() {
	cardsAPI = new Cards();

	console.log('Fetching the existing collection of cards ...');
	existingCardCollection = await cardsAPI.getControversySlugs();

	console.log('\nThe current set of cards is:')
	console.log(existingCardCollection);

	const schema = {
		properties: {
			confirmation: {
				pattern: /^(y|n|yes|no)$/,
				description: colors.red.bold('Are you sure you want to delete the existing collection of controversy cards?'),
				message: colors.white('(y)es or (n)o'),
				required: true
			}
		}
	};

	prompt.start();

	prompt.get(schema, (err, result) => {
		if (result.confirmation === 'y' ||
			result.confirmation === 'yes') {

			existingCardCollection.forEach(slug => {
				console.log('\nDeleting controversy card ' + slug);
				cardsAPI.deleteControversy(slug);
			});
		}
	});
}

try {
	clearCollection();
}
catch(e) {
	console.log(e);
}
