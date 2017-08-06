import { invokeApig } from './api';
import { api } from './config';

export default class Feeds {
	constructor() {

	}

	createFeed(cardSlug, feedSlug, feedName, feedCategories, text, feedAuthors, images, discourseLevel, publishDate, updateDate) {
		const body = {
			feedSlug,
			feedName,
			feedCategories,
			text,
			feedAuthors,
			images,
			discourseLevel,
			publishDate,
			updateDate
		};

		return invokeApig({
			base: api.feeds,
			path: cardSlug,
			method: 'POST',
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

	updateFeed(cardSlug, feedSlug, feedName, feedCategories, text, feedAuthors, images, discourseLevel, publishDate, updateDate) {
		const body = {
			feedName,
			feedCategories,
			text,
			feedAuthors,
			images,
			discourseLevel,
			publishDate,
			updateDate
		};

		return invokeApig({
			base: api.feeds,
			path: cardSlug + '/' + feedSlug,
			method: 'PUT',
			body
		});
	}
};
