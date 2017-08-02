'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.invokeApig = invokeApig;
// From http://serverless-stack.com/chapters/call-the-create-api.html
async function invokeApig(_ref, userToken) {
	var base = _ref.base,
	    path = _ref.path,
	    _ref$method = _ref.method,
	    method = _ref$method === undefined ? 'GET' : _ref$method,
	    body = _ref.body;


	var url = '' + base + path;

	// TODO: Add user token to request header
	var headers = {
		// Authorization: userToken
	};

	body = body ? JSON.stringify(body) : body;

	var results = await fetch(url, {
		method: method,
		body: body,
		headers: headers
	});

	if (results.status !== 200) {
		throw new Error((await results.text()));
	}

	return results.json();
}

var url = exports.url = {
	api: {
		feeds: 'https://nz2t3hld20.execute-api.us-west-1.amazonaws.com/prod/feeds/',
		cards: 'https://q9paj2zuf1.execute-api.us-west-1.amazonaws.com/prod/controversies/'
	},
	images: {
		feeds: 'https://controversy-cards-feeds.s3.amazonaws.com/',
		cards: 'https://controversy-cards-images.s3.amazonaws.com/'
	}
};