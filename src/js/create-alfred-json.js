'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // Markdown processor used by Stack


var _admZip = require('adm-zip');

var _admZip2 = _interopRequireDefault(_admZip);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./libs/config');

var _utils = require('./libs/utils');

var _loadJsonFile = require('load-json-file');

var _loadJsonFile2 = _interopRequireDefault(_loadJsonFile);

var _pagedown = require('pagedown');

var _pagedown2 = _interopRequireDefault(_pagedown);

var _shortHash = require('short-hash');

var _shortHash2 = _interopRequireDefault(_shortHash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var zip = void 0,
    rawQuotes = void 0,
    alfredJSONList = void 0,
    rawAlfredJSON = [],
    physorgJSON = [],
    gplusJSON = [];

var markdownConverter = _pagedown2.default.getSanitizingConverter();

function fetchAlfredJSONList() {
	return new Promise(function (resolve, reject) {
		_fs2.default.readdir(_config.alfred.output.raw, function (err, files) {
			if (err) {
				reject(err);
			} else {
				resolve((0, _utils.removeSystemFiles)(files));
			}
		});
	});
}

function loadAllAlfredJSON() {
	return new Promise(function (resolve, reject) {
		var total = alfredJSONList.length;

		var read = function read(count) {
			var jsonPath = alfredJSONList[count];

			console.log('Reading ' + jsonPath + ' ...');

			(0, _loadJsonFile2.default)(jsonPath).then(function (json) {
				++count;

				if (count === total) {
					resolve();
				} else {
					rawAlfredJSON.push(json);
					read(count);
				}
			});
		};

		read(0);
	});
}

function processRawAlfredJSON() {
	return new Promise(function (resolve, reject) {
		rawAlfredJSON.forEach(function (quote) {
			var quoteName = quote['alfredsnippet']['name'],
			    quoteKeyword = quote['alfredsnippet']['keyword'],
			    quoteSnippet = quote['alfredsnippet']['snippet'],
			    quoteSeries = quoteName,
			    // default when just one part
			quoteSeriesItem = 0,
			    // default when just one part
			quoteSeriesHash = void 0;

			// Remove any continuation indicators from snippets
			// These only occur in the phys.org posts
			quoteSnippet = quoteSnippet.replace('(cont\'d)\n\n', '');
			quoteSnippet = quoteSnippet.replace('\n\n(cont\'d)', '');

			if (quoteName.match(/^Phys\.org Post - /)) {
				// Remove any prefixes from the names
				quoteName = quoteName.replace('Phys.org Post - ', '');

				if (quoteName.match(' - Part ')) {
					var _quoteName$split = quoteName.split(' - Part ');

					var _quoteName$split2 = _slicedToArray(_quoteName$split, 2);

					quoteSeries = _quoteName$split2[0];
					quoteSeriesItem = _quoteName$split2[1];
				}

				quoteSeriesHash = (0, _shortHash2.default)(quoteSeries);

				// Remove keyword prefix that was used to specify
				// that this is a Phys.org-formatted snippet
				quoteKeyword = quoteKeyword.replace(/^pp\s/, '');
				quoteKeyword = quoteKeyword.replace(/\s\d+$/, '');

				physorgJSON.push({
					recordType: 'quote',
					sortBy: quoteName,
					id: (0, _utils.createSlug)(quoteName),
					quoteName: quoteName,
					quoteSeriesHash: quoteSeriesHash,
					quoteSeriesItem: quoteSeriesItem,
					facetCategory: 'Quotes',
					facetSubCategory: quoteKeyword,
					quoteParagraph: quoteSnippet
				});
			} else if (quoteName.match(/^G\+ Post - /)) {
				// Remove any prefixes from the names
				quoteName = quoteName.replace('G+ Post - ', '');

				// Remove keyword prefix that was used to specify
				// that this is a G+-formatted snippet
				quoteKeyword = quoteKeyword.replace(/^gp\s/, '');

				gplusJSON.push({
					id: (0, _utils.createSlug)(quoteName),
					quoteName: quoteName,
					keyword: quoteKeyword,
					quoteParagraph: markdownConverter.makeHtml(quoteSnippet)
				});
			}
		});

		resolve();
	});
}

function saveAlfredGplusJSON() {
	new Promise(function (resolve, reject) {
		_fs2.default.writeFile(_config.alfred.output.gplus, JSON.stringify(gplusJSON), "utf8", function () {
			return resolve();
		});
	});
}

function saveAlfredPhysorgJSON() {
	new Promise(function (resolve, reject) {
		_fs2.default.writeFile(_config.alfred.output.physorg, JSON.stringify(physorgJSON), "utf8", function () {
			return resolve();
		});
	});
}

console.log('Unzipping Alfred snippets export ...');

new Promise(function (resolve, reject) {
	resolve(new _admZip2.default(_config.alfred.input));
})

// Alfred Snippet exports are stored as a set of zipped JSON files
.then(function (zip) {
	new Promise(function (resolve, reject) {
		resolve(zip.extractAllTo(_config.alfred.output.raw, true));
	});
}).then(function () {
	console.log('\nFetching the list of raw Alfred JSON files ...');

	return fetchAlfredJSONList();
}).then(function (json) {
	alfredJSONList = json.map(function (path) {
		return _config.alfred.output.raw + '/' + path;
	});

	console.log('\nFetching all generated JSON ...\n');

	return loadAllAlfredJSON();
}).then(function () {
	console.log('\nProcessing the raw Alfred JSON ...');

	return processRawAlfredJSON();
}).then(function () {
	console.log('\nSaving the processed JSON to the output ' + _config.alfred.output.gplus);

	return saveAlfredGplusJSON();
}).then(function () {
	console.log('\nSaving the processed JSON to the output ' + _config.alfred.output.physorg);

	return saveAlfredPhysorgJSON();
}).catch(function (error) {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});