'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var thumbnailSize = exports.thumbnailSize = 105,
    // was 506

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


// Hard-coded JSON data input
input = exports.input = {
	proto: 'json/inputs/halton-arp.json',
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
};