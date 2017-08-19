'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.invokeApig = invokeApig;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _sigV4Client = require('./sigV4Client');

var _sigV4Client2 = _interopRequireDefault(_sigV4Client);

var _config = require('./config');

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// From http://serverless-stack.com/chapters/call-the-create-api.html
// But, modified to use a Node version of fetch rather than the 
// whatwg-fetch version.

// export async function invokeApig(
// 	{ base,
// 	  path = '',
// 	  method = 'GET',
// 	  body = {} }, userToken) {

// 	const url = `${base}${path}`;

// 	// TODO: Add user token to request header
// 	const headers = {
// 		// Authorization: userToken
// 	};

// 	body = (body) ? JSON.stringify(body) : body;

// 	return fetch(url, { method, body, headers })
// 		.then(res => {
// 			return res.json();
// 		})
// 		.then(json => {
// 			return json;
// 		});
// }

// http://serverless-stack.com/chapters/connect-to-api-gateway-with-iam-auth.html
// Useful information on API gateway policies here: http://docs.aws.amazon.com/
// apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
async function invokeApig(_ref, userToken) {
	var base = _ref.base,
	    _ref$path = _ref.path,
	    path = _ref$path === undefined ? '' : _ref$path,
	    _ref$method = _ref.method,
	    method = _ref$method === undefined ? 'GET' : _ref$method,
	    _ref$headers = _ref.headers,
	    headers = _ref$headers === undefined ? {} : _ref$headers,
	    _ref$queryParams = _ref.queryParams,
	    queryParams = _ref$queryParams === undefined ? {} : _ref$queryParams,
	    body = _ref.body;


	var credentials = new _awsSdk2.default.SharedIniFileCredentials({ profile: 'serverless' });
	_awsSdk2.default.config.credentials = credentials;

	// Note that we are handling this base a bit differently here than in react-worldviewer-app,
	// where we send in either 'feeds' or 'cards' rather than the actual base
	console.log('base: ' + base);
	console.log(method + ': ' + path);
	console.log('AWS.config.credentials.accessKeyId: ' + _awsSdk2.default.config.credentials.accessKeyId);
	console.log('AWS.config.credentials.secretAccessKey: ' + _awsSdk2.default.config.credentials.secretAccessKey + '\n\n');

	// "We are simply following the steps to make a signed request to API
	// Gateway here. We first get our temporary credentials using getAwsCredentials
	// and then using the sigV4Client we sign our request. We then use the signed
	// headers to make a HTTP fetch request."
	var signedRequest = _sigV4Client2.default.newClient({
		accessKey: _awsSdk2.default.config.credentials.accessKeyId,
		secretKey: _awsSdk2.default.config.credentials.secretAccessKey,
		sessionToken: _awsSdk2.default.config.credentials.sessionToken,
		region: 'us-west-1', // WARNING: HARDCODED
		endpoint: base
	}).signRequest({
		method: method,
		path: path,
		headers: headers,
		queryParams: queryParams,
		body: body
	});

	body = body ? JSON.stringify(body) : body;
	headers = signedRequest.headers;

	var results = await (0, _nodeFetch2.default)(signedRequest.url, {
		method: method,
		headers: headers,
		body: body
	});

	if (results.status !== 200) {
		throw new Error((await results.text()));
	}

	return results.json();
}