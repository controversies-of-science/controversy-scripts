'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _api = require('./api');

var _config = require('./config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cards = function () {
	function Cards() {
		_classCallCheck(this, Cards);
	}

	_createClass(Cards, [{
		key: 'createControversy',
		value: function createControversy(slug, name, summary, category, text) {
			var body = {
				slug: slug,
				name: name,
				summary: summary,
				category: category,
				text: text
			};

			return (0, _api.invokeApig)({
				base: _config.api.cards,
				method: 'PUT',
				body: body
			});
		}
	}, {
		key: 'getControversy',
		value: function getControversy(slug) {
			return (0, _api.invokeApig)({
				base: _config.api.cards,
				path: slug
			});
		}
	}, {
		key: 'getControversySlugs',
		value: function getControversySlugs() {
			return (0, _api.invokeApig)({
				base: _config.api.cards
			});
		}
	}, {
		key: 'deleteControversy',
		value: function deleteControversy(slug) {
			return (0, _api.invokeApig)({
				base: _config.api.cards,
				path: slug,
				method: 'DELETE'
			});
		}

		// TODO: Remove slug from body in API

	}, {
		key: 'updateControversy',
		value: function updateControversy(slug, name, summary, category, text) {
			var body = {
				name: name,
				summary: summary,
				category: category,
				text: text
			};

			return (0, _api.invokeApig)({
				base: _config.api.cards,
				path: slug,
				method: 'PUT',
				body: body
			});
		}
	}]);

	return Cards;
}();

exports.default = Cards;
;