import { invokeApig } from './api';
import { api } from './config';

export default class Feeds {
	constructor() {

	}

	createFeed(cardSlug, feedSlug, name, summary, category, text, posted, author, images) {
		const body = {
			feedSlug,
			name,
			summary,
			category,
			text,
			posted,
			author,
			images
		};

		return invokeApig({
			base: api.feeds,
			path: cardSlug,
			method: 'PUT',
			body
		});
	}

	getFeed(cardSlug, feedSlug) {
		return invokeApig({
			base: api.feeds,
			path: cardSlug + '/' + feedSlug
		});
	}

	getFeedSlugs(cardSlug) {
		return invokeApig({
			base: api.feeds,
			path: cardSlug
		});
	}

	deleteFeed(cardSlug, feedSlug) {
		return invokeApig({
			base: api.feeds,
			path: cardSlug + '/' + feedSlug,
			method: 'DELETE'
		});
	}

	updateFeed(cardSlug, feedSlug, name, summary, category, text, posted, author, images) {
		const body = {
			name,
			summary,
			category,
			text,
			posted,
			author,
			images
		};

		return invokeApig({
			base: api.feeds,
			path: cardSlug + '/' + feedSlug,
			method: 'PUT',
			body
		});
	}
};
