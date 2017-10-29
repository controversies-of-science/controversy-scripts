import { cloudfront, input, output, stop } from './libs/config';
import { createSlug, splitText } from './libs/utils';

import fs from 'fs';
import loadJSONFile from 'load-json-file';

let
	algolia = {
		sliced: {
			cards: [] // The data structure we will build
		}
	},

	google = {
		cards: null // from G+ API
	};

// Grab the generated JSON output from the scrape-gplus script
new Promise((resolve, reject) => {
	resolve(loadJSONFile(output.gplus));
})

.then(collection => {
	google.cards = collection;

	// Grab the metadata which has been manually typed in for each controversy card
	return new Promise((resolve, reject) => {
		resolve(loadJSONFile(input.cards));
	})
})

// Compose hardcoded JSON and G+ collection controversy card data
// into a single object, algolia.sliced.cards for sending data to
// Algolia Search: We need slug, name, thumbnail, unique paragraph
// id and paragraph, but for searchable fields, there should be no
// redundancy.  The redundancy should all occur with the metadata.
.then(cardsJSON => {
	return new Promise((resolve, reject) => {
		console.log("\nSeeding Algolia cards index from G+ collection and hardcoded cards.json input ...\n");

		google.cards.forEach((gplusCard) => {
			// Generate the slug
			let slug = createSlug(gplusCard.name);

			console.log('Saving JSON to ' + output.cards + ': ' + slug);

			// Get the hardcoded JSON data for this card by matching slugs
			let json = cardsJSON.filter((el) => el.slug === slug ? true : false)[0],

			// Split and label the text by paragraphs
			splitByParagraph = splitText(slug, gplusCard.text, stop.cards, true);

			// Remove the last paragraph, which is an unnecessary hashtag category
			splitByParagraph.pop();

			// This is the redundant part
			let algoliaMetadata = {
					facetCategory: 'Controversy Cards',
					facetSubCategory: gplusCard.category,
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
							url: cloudfront.cards + slug + '/thumbnail.jpg'
						},
						pyramid: {
							// url: cloudfront.cards + slug + '/pyramid_files/',
							maxZoomLevel: json.images.pyramid.maxZoomLevel,
							TileSize: json.images.pyramid.TileSize
						}
					}
				};

			// Save card name one time
			let cardNameJSON = Object.assign({},
				{ cardName: gplusCard.name },
				algoliaMetadata);

			algolia.sliced.cards =
				algolia.sliced.cards.concat(cardNameJSON);

			// Save card category one time
			// let categoryJSON = Object.assign({},
			// 	{ cardCategory: gplusCard.category },
			// 	algoliaMetadata);

			// algolia.sliced.cards =
			// 	algolia.sliced.cards.concat(categoryJSON);

			// Save card summary one time
			let summaryJSON = Object.assign({},
				{ cardSummary: gplusCard.summary },
				algoliaMetadata);

			// Do not save the summary when it is exactly the same as the card name
			if (gplusCard.name !== gplusCard.summary) {
				algolia.sliced.cards =
					algolia.sliced.cards.concat(summaryJSON);
			}

			// Save all paragraphs for card just one time
			let smallerChunkJSON = splitByParagraph.map(paragraphJSON => 
				Object.assign({},
					{id: paragraphJSON.id,
					cardParagraph: paragraphJSON.paragraph},
					algoliaMetadata)
			);

			algolia.sliced.cards =
				algolia.sliced.cards.concat(smallerChunkJSON);

			resolve();
		});
	});
})

// Export that composed object to a JSON file, for importing into Algolia search service
.then(() => {
	return new Promise((resolve, reject) => {
		if (algolia.sliced.cards) {
			console.log('\nExporting the combined JSON to ' + output.cards);

			fs.writeFile(output.cards,
				JSON.stringify(algolia.sliced.cards),
				'utf-8',
				(err) => {

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
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});