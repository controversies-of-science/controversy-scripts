import { invokeApig, url } from './api';

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

		return invokeApig(
			url.api.feeds,
			cardSlug,
			'PUT',
			body
		);
	}

	getFeed(cardSlug, feedSlug) {
		return invokeApig(
			url.api.feeds,
			cardSlug + '/' + feedSlug
		);
	}

	getFeedSlugs(cardSlug) {
		return invokeApig(
			url.api.feeds,
			cardSlug
		);
	}

	deleteFeed(cardSlug, feedSlug) {
		return invokeApig(
			url.api.feeds,
			cardSlug + '/' + feedSlug,
			'DELETE'
		);
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

		return invokeApig(
			url.api.feeds,
			cardSlug + '/' + feedSlug,
			'PUT',
			body
		);
	}
};
