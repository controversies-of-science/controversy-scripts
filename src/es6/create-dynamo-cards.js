import Cards from './libs/cards';
import prompt from 'prompt';
import colors from 'colors/safe';
import loadJSONFile from 'load-json-file';
import { output } from './libs/config';
import { createSlug, splitText } from './libs/utils';

let existingCardCollection = [],
	cardsAPI,
	jsonCardData,
	controversies;

async function clearCollection() {
	cardsAPI = new Cards();

	console.log('Fetching the existing collection of cards ...');
	existingCardCollection = await cardsAPI.getControversySlugs();

	console.log('\nThe current set of cards is:')
	console.log(existingCardCollection);

	// Configuration for validation prompt
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

	prompt.get(schema, async (err, result) => {
		if (result.confirmation === 'y' ||
			result.confirmation === 'yes') {

			for (let slug of existingCardCollection) {
				console.log('\nDeleting controversy card ' + slug);
				await cardsAPI.deleteControversy(slug);
			}
		} else {
			return;
		}
	});

	return;
}

async function getScrapedCollection() {
	return await loadJSONFile(output.gplus);
}

async function putAllScrapedControversies(controversies) {
	controversies.forEach(controversy => {
		console.log(controversy);
		console.log('');
	});
}

async function main() {
	try {
		await clearCollection();
		jsonCardData = await getScrapedCollection();

		controversies = jsonCardData.map(card => {
			return {
				slug: createSlug(card.name),
				name: card.name,
				summary: card.summary,
				category: card.category,
				text: splitText(card.text)
			}
		});

		putAllScrapedControversies(controversies);
	}
	catch(e) {
		console.log(e);
	}	
}

main();