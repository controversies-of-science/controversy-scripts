import Cards from './libs/cards';
import prompt from 'prompt';
import colors from 'colors/safe';
import loadJSONFile from 'load-json-file';
import { output, stop, api } from './libs/config';
import { createSlug, splitText } from './libs/utils';

let existingCardCollection = [],
	cardsAPI,
	jsonCardData,
	controversies;

function fetchExistingCards() {
	return new Promise((resolve, reject) => {
		cardsAPI = new Cards();

		console.log('Fetching the existing collection of cards ...');
		resolve(cardsAPI.getControversySlugs());
	});
}

function deleteExistingCards() {
	let promiseArray = existingCardCollection.map(slug => {
		return new Promise((resolve, reject) => {
			console.log('Deleting controversy card ' + slug);
			resolve(cardsAPI.deleteControversy(slug));
		});
	});

	return Promise.all(promiseArray);
}

function confirmCardDeletion() {
	// Configuration for validation prompt
	const schema = {
		properties: {
			confirmation: {
				pattern: /^(y|n|yes|no)$/,
				description: colors.red.bold('Do you want to delete the existing collection of controversy cards at the cards API endpoint?'),
				message: colors.white('(y)es or (n)o'),
				required: true
			}
		}
	};

	prompt.start();

	// If there is no promise here, the script will continue before
	// getting the answer
	return new Promise((resolve, reject) => {
		prompt.get(schema, (err, result) => {
			if (result.confirmation === 'y' ||
				result.confirmation === 'yes') {

				resolve(deleteExistingCards());
			} else {
				resolve();
			}
		});
	});
}

function getScrapedCollection() {
	return new Promise((resolve, reject) => {
		resolve(loadJSONFile(output.gplus));
	});
}

function putAllScrapedControversies(controversies) {

}

fetchExistingCards()

.then(slugs => {
	console.log('\nThe current set of cards in the API is:\n')
	console.log(slugs);

	existingCardCollection = slugs;

	if (existingCardCollection.length > 0) {
		return confirmCardDeletion();
	} else {
		return;
	}
})

.then(() => {
	console.log('\nNow fetching the G+ collection data from local JSON file ...');

	return getScrapedCollection();
})

.then(data => {
	jsonCardData = data;

	console.log('\nThere are ' + jsonCardData.length + ' cards in the JSON file. Now constructing our API objects ...');

	controversies = jsonCardData.map(card => {
		const slug = createSlug(card.name);

		return {
			slug,
			name: card.name,
			summary: card.summary,
			category: card.category,
			text: splitText(slug, card.text, stop.cards)
		}
	});

	putAllScrapedControversies(controversies);
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
