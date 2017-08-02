import { invokeApig, url } from './api';

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

		return invokeApig(
			url.api.cards,
			'', // root
			'PUT',
			body
		);
	}

	getControversy(slug) {
		return invokeApig(
			url.api.cards,
			slug
		);
	}

	getControversySlugs() {
		return invokeApig(
			url.api.cards,
			''
		);
	}

	deleteControversy(slug) {
		return invokeApig(
			url.api.cards,
			slug,
			'DELETE'
		);
	}

	// TODO: Remove slug from body in API
	updateControversy(slug, name, summary, category, text) {
		const body = {
			name,
			summary,
			category,
			text
		};

		return invokeApig(
			url.api.cards,
			slug,
			'PUT',
			body
		);
	}
};
