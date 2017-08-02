// From http://serverless-stack.com/chapters/call-the-create-api.html
export async function invokeApig(
	{ base,
	  path,
	  method = 'GET',
	  body }, userToken) {

	const url = `${base}${path}`;

	// TODO: Add user token to request header
	const headers = {
		// Authorization: userToken
	};

	body = (body) ? JSON.stringify(body) : body;

	const results = await fetch(url, {
		method,
		body,
		headers
	});

	if (results.status !== 200) {
		throw new Error(await results.text());
	}

	return results.json();
}

export const url = {
	api: {
		feeds: 'https://nz2t3hld20.execute-api.us-west-1.amazonaws.com/prod/feeds/',
		cards: 'https://q9paj2zuf1.execute-api.us-west-1.amazonaws.com/prod/controversies/'
	},
	images: {
		feeds: 'https://controversy-cards-feeds.s3.amazonaws.com/',
		cards: 'https://controversy-cards-images.s3.amazonaws.com/'
	}
};
