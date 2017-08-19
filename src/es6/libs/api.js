import fetch from 'node-fetch';
import sigV4Client from './sigV4Client';
import { api } from './config';
import AWS from 'aws-sdk';

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
export async function invokeApig(
	{ base,
		path = '',
		method = 'GET',
		headers = {},
		queryParams = {},
		body }, userToken) {

	const credentials = new AWS.SharedIniFileCredentials({profile: 'serverless'});
	AWS.config.credentials = credentials;

	// Note that we are handling this base a bit differently here than in react-worldviewer-app,
	// where we send in either 'feeds' or 'cards' rather than the actual base
	console.log('base: ' + base);
	console.log(method + ': ' + path);
	console.log('AWS.config.credentials.accessKeyId: ' + AWS.config.credentials.accessKeyId);
	console.log('AWS.config.credentials.secretAccessKey: ' + AWS.config.credentials.secretAccessKey + '\n\n');

	// "We are simply following the steps to make a signed request to API
	// Gateway here. We first get our temporary credentials using getAwsCredentials
	// and then using the sigV4Client we sign our request. We then use the signed
	// headers to make a HTTP fetch request."
	const signedRequest = sigV4Client
		.newClient({
			accessKey: AWS.config.credentials.accessKeyId,
			secretKey: AWS.config.credentials.secretAccessKey,
			sessionToken: AWS.config.credentials.sessionToken,
			region: 'us-west-1', // WARNING: HARDCODED
			endpoint: base,
		})
		.signRequest({
			method,
			path,
			headers,
			queryParams,
			body
		});

	body = body ? JSON.stringify(body) : body;
	headers = signedRequest.headers;

	const results = await fetch(signedRequest.url, {
		method,
		headers,
		body
	});

	if (results.status !== 200) {
		throw new Error(await results.text());
	}

	return results.json();
}
