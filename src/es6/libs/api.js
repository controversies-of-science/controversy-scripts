import fetch from 'node-fetch';

// From http://serverless-stack.com/chapters/call-the-create-api.html
// But, modified to use a Node version of fetch rather than the 
// whatwg-fetch version.
export async function invokeApig(
	{ base,
	  path = '',
	  method = 'GET',
	  body = {} }, userToken) {

	const url = `${base}${path}`;

	// TODO: Add user token to request header
	const headers = {
		// Authorization: userToken
	};

	body = (body) ? JSON.stringify(body) : body;

	return fetch(url, { method, body, headers })
		.then(res => {
			return res.json();
		})
		.then(json => {
			return json;
		});
}
