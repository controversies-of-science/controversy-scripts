'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.invokeApig = invokeApig;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// From http://serverless-stack.com/chapters/call-the-create-api.html
// But, modified to use a Node version of fetch rather than the 
// whatwg-fetch version.
async function invokeApig(_ref, userToken) {
	var base = _ref.base,
	    _ref$path = _ref.path,
	    path = _ref$path === undefined ? '' : _ref$path,
	    _ref$method = _ref.method,
	    method = _ref$method === undefined ? 'GET' : _ref$method,
	    _ref$body = _ref.body,
	    body = _ref$body === undefined ? {} : _ref$body;


	var url = '' + base + path;

	// TODO: Add user token to request header
	var headers = {
		// Authorization: userToken
	};

	body = body ? JSON.stringify(body) : body;

	return (0, _nodeFetch2.default)(url, { method: method, body: body, headers: headers }).then(function (res) {
		return res.json();
	}).then(function (json) {
		return json;
	});
}