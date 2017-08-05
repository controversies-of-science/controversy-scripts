import Cards from './libs/cards';
import prompt from 'prompt';
import colors from 'colors/safe';
import loadJSONFile from 'load-json-file';
import { input, output, stop, api } from './libs/config';
import { createSlug, splitText } from './libs/utils';

let existingCardCollection = [],
	cardsAPI,
	gplusCardJSON,
	localCardJSON,
	controversies;

function fetchExistingCards() {
	return new Promise((resolve, reject) => {
		cardsAPI = new Cards();

		console.log('Fetching the existing collection of cards ...');
		resolve(cardsAPI.getControversySlugs());
	});
}

function deleteExistingCards() {
	console.log('');

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
		console.log('');

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

function getLocalCardJSON() {
	return new Promise((resolve, reject) => {
		resolve(loadJSONFile(input.cards));
	});
}

// I'm using a recursive promise chain because I would prefer that
// these happen in a predictable order.
function postAllScrapedControversies(controversies) {
	console.log('\nNow saving controversy cards to cards API ...\n');

	new Promise((resolve, reject) => {
		let putControversy = function(count) {
			const
				card = controversies[count],
				slug = createSlug(card.cardName);

			console.log(count + ': Saving controversy card to card API: ' + card.cardName);

			// TODO: Add error state
			cardsAPI.createControversy(
				slug,
				card.shortSlug,
				card.cardName,
				card.cardSummary,
				card.cardCategory,
				card.text,
				card.cardAuthor,
				card.gplusUrl,
				card.publishDate,
				card.updateDate,
				card.images)

				.then(data => {
					const next = ++count;

					if (next >= controversies.length) {
						resolve();
					} else {
						putControversy(next);
					}
				}).catch(data => {
					console.log('ERROR:');
					console.log(data);

					reject();
				});
		}

		putControversy(0);
	});
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
	console.log('\nNow fetching the local hardcoded data that will be mixed into the G+ collection data ...');

	return getLocalCardJSON();
})

.then((data) => {
	const localCardHash = {};

	// Create a hash map for easier referencing
	for (let card of data) {
		localCardHash[card.slug] = {
			shortSlug: card['short-slug'],
			images: card['images']
		}
	}

	localCardJSON = localCardHash;

	console.log('\nNow fetching the G+ collection data from local JSON file ...');

	return getScrapedCollection();
})

.then(async data => {
	gplusCardJSON = data;

	console.log('\nThere are ' + gplusCardJSON.length + ' cards in the JSON file. Now constructing our API objects ...');

	controversies = gplusCardJSON.map(card => {
		const slug = createSlug(card.name);

		return {
			slug,
			shortSlug: localCardJSON[slug].shortSlug,
			cardName: card.name,
			cardSummary: card.summary,
			cardCategory: card.category,
			text: splitText(slug, card.text, stop.cards),
			cardAuthor: 'Chris Reeve',
			gplusUrl: card.url,
			publishDate: card.publishDate,
			updateDate: card.updateDate,
			images: localCardJSON[slug].images
		}
	});

	return controversies;
})

.then((controversies) => {
	postAllScrapedControversies(controversies);
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
