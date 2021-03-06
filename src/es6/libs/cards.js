import { invokeApig } from './api';
import { api } from './config';

export default class Cards {
	constructor() {

	}

	createControversy(slug, shortSlug, cardName, cardSummary, cardCategory, text, cardAuthor, gplusUrl, publishDate, updateDate, images) {
		const body = {
			slug,
			shortSlug,
			cardName,
			cardSummary,
			cardCategory,
			text,
			cardAuthor,
			gplusUrl,
			publishDate,
			updateDate,
			images
		};

		return invokeApig({
			base: api.cards,
			method: 'POST',
			body
		});
	}

	getControversy(slug) {
		return invokeApig({
			base: api.cards,
			path: slug
		});
	}

	getControversySlugs() {
		return invokeApig({
			base: api.cards
		});
	}

	deleteControversy(slug) {
		return invokeApig({
			base: api.cards,
			path: slug,
			method: 'DELETE'
		});
	}

	// TODO: Remove slug from body in API
	updateControversy(slug, shortSlug, cardName, cardSummary, cardCategory, text, cardAuthor, gplusUrl, publishDate, updateDate, images) {
		const body = {
			shortSlug,
			cardName,
			cardSummary,
			cardCategory,
			text,
			cardAuthor,
			gplusUrl,
			publishDate,
			updateDate,
			images
		};

		return invokeApig({
			base: api.cards,
			path: slug,
			method: 'PUT',
			body
		});
	}
};
