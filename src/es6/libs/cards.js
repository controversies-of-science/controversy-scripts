import { invokeApig } from './api';
import { api } from './config';

export default class Cards {
	constructor() {

	}

	createControversy(slug, name, summary, category, text) {
		const body = {
			slug,
			name,
			summary,
			category,
			text
		};

		return invokeApig({
			base: api.cards,
			method: 'PUT',
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
	updateControversy(slug, name, summary, category, text) {
		const body = {
			name,
			summary,
			category,
			text
		};

		return invokeApig({
			base: api.cards,
			path: slug,
			method: 'PUT',
			body
		});
	}
};
