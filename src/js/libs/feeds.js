'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _api = require('./api');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Feeds = function () {
	function Feeds() {
		_classCallCheck(this, Feeds);
	}

	_createClass(Feeds, [{
		key: 'createFeed',
		value: function createFeed(cardSlug, feedSlug, name, summary, category, text, posted, author, images) {
			var body = {
				feedSlug: feedSlug,
				name: name,
				summary: summary,
				category: category,
				text: text,
				posted: posted,
				author: author,
				images: images
			};

			return (0, _api.invokeApig)(_api.url.api.feeds, cardSlug, 'PUT', body);
		}
	}, {
		key: 'getFeed',
		value: function getFeed(cardSlug, feedSlug) {
			return (0, _api.invokeApig)(_api.url.api.feeds, cardSlug + '/' + feedSlug);
		}
	}, {
		key: 'getFeedSlugs',
		value: function getFeedSlugs(cardSlug) {
			return (0, _api.invokeApig)(_api.url.api.feeds, cardSlug);
		}
	}, {
		key: 'deleteFeed',
		value: function deleteFeed(cardSlug, feedSlug) {
			return (0, _api.invokeApig)(_api.url.api.feeds, cardSlug + '/' + feedSlug, 'DELETE');
		}
	}, {
		key: 'updateFeed',
		value: function updateFeed(cardSlug, feedSlug, name, summary, category, text, posted, author, images) {
			var body = {
				name: name,
				summary: summary,
				category: category,
				text: text,
				posted: posted,
				author: author,
				images: images
			};

			return (0, _api.invokeApig)(_api.url.api.feeds, cardSlug + '/' + feedSlug, 'PUT', body);
		}
	}]);

	return Feeds;
}();

exports.default = Feeds;
;