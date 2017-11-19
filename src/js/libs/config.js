'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var thumbnailSize = exports.thumbnailSize = 640,
    // was 105
thumbnailFilename = exports.thumbnailFilename = 'small.jpg',


// Hard-coded local data directory structures
dir = exports.dir = {
	images: {
		cards: 'img/cards/',
		feeds: ['img/feeds/halton-arp-the-modern-galileo/worldview/', 'img/feeds/halton-arp-the-modern-galileo/model/', 'img/feeds/halton-arp-the-modern-galileo/propositional/', 'img/feeds/halton-arp-the-modern-galileo/conceptual/', 'img/feeds/halton-arp-the-modern-galileo/narrative/']
	},
	md: {
		feeds: ['md/feeds/halton-arp-the-modern-galileo/worldview/', 'md/feeds/halton-arp-the-modern-galileo/model/', 'md/feeds/halton-arp-the-modern-galileo/propositional/', 'md/feeds/halton-arp-the-modern-galileo/conceptual/', 'md/feeds/halton-arp-the-modern-galileo/narrative/']
	}
},


// Asset CDN's
url = exports.url = {
	feeds: 'https://controversy-cards-feeds.s3.amazonaws.com/halton-arp-the-modern-galileo/',
	cards: 'https://controversy-cards-images.s3.amazonaws.com/'
},
    cloudfront = exports.cloudfront = {
	feeds: 'https://d2rubbqaoavtmn.cloudfront.net/halton-arp-the-modern-galileo/',
	cards: 'https://d1kzghpdhj1ism.cloudfront.net/'
},
    api = exports.api = {
	feeds: 'https://wu7nsd6i3a.execute-api.us-west-1.amazonaws.com/prod/feeds/',
	cards: 'https://1xh0wwfkjf.execute-api.us-west-1.amazonaws.com/prod/controversies/'
},


// Hard-coded JSON data input
input = exports.input = {
	cards: 'json/inputs/cards.json',
	feeds: 'json/inputs/feeds.json'
},


// JSON outputs for Algolia Search
output = exports.output = {
	cards: 'json/generated/algolia-cards.json',
	feeds: 'json/generated/algolia-feeds.json',
	gplus: 'json/generated/gplus-collection.json'
},


// Algolia Search requires that paragraphs are chunked into separate records.
// This split string differs by markdown processor; Google+ uses a pair of <br>'s,
// whereas pageDown uses a pair of carriage returns.
stop = exports.stop = {
	cards: '<br /><br />',
	feeds: '\n\n'
},
    alfred = exports.alfred = {
	input: 'alfred/ScienceQuotes.alfredsnippets',
	output: {
		raw: 'alfred/json',
		gplus: 'json/generated/alfred-gplus.json',
		physorg: 'json/generated/alfred-physorg.json'
	}
};