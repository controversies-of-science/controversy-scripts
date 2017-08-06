'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _api = require('./api');

var _config = require('./config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Feeds = function () {
	function Feeds() {
		_classCallCheck(this, Feeds);
	}

	_createClass(Feeds, [{
		key: 'createFeed',
		value: function createFeed(cardSlug, feedSlug, feedName, feedCategories, text, feedAuthors, images, discourseLevel, publishDate, updateDate) {
			var body = {
				feedSlug: feedSlug,
				feedName: feedName,
				feedCategories: feedCategories,
				text: text,
				feedAuthors: feedAuthors,
				images: images,
				discourseLevel: discourseLevel,
				publishDate: publishDate,
				updateDate: updateDate
			};

			return (0, _api.invokeApig)({
				base: _config.api.feeds,
				path: cardSlug,
				method: 'POST',
				body: body
			});
		}
	}, {
		key: 'getFeed',
		value: function getFeed(cardSlug, feedSlug) {
			return (0, _api.invokeApig)({
				base: _config.api.feeds,
				path: cardSlug + '/' + feedSlug
			});
		}
	}, {
		key: 'getFeedSlugs',
		value: function getFeedSlugs(cardSlug) {
			return (0, _api.invokeApig)({
				base: _config.api.feeds,
				path: cardSlug
			});
		}
	}, {
		key: 'deleteFeed',
		value: function deleteFeed(cardSlug, feedSlug) {
			return (0, _api.invokeApig)({
				base: _config.api.feeds,
				path: cardSlug + '/' + feedSlug,
				method: 'DELETE'
			});
		}
	}, {
		key: 'updateFeed',
		value: function updateFeed(cardSlug, feedSlug, feedName, feedCategories, text, feedAuthors, images, discourseLevel, publishDate, updateDate) {
			var body = {
				feedName: feedName,
				feedCategories: feedCategories,
				text: text,
				feedAuthors: feedAuthors,
				images: images,
				discourseLevel: discourseLevel,
				publishDate: publishDate,
				updateDate: updateDate
			};

			return (0, _api.invokeApig)({
				base: _config.api.feeds,
				path: cardSlug + '/' + feedSlug,
				method: 'PUT',
				body: body
			});
		}
	}]);

	return Feeds;
}();

exports.default = Feeds;
;