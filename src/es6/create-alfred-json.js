import AdmZip from 'adm-zip';
import fs from 'fs';
import { alfred } from './libs/config';
import { removeSystemFiles, createSlug } from './libs/utils';
import loadJSONFile from 'load-json-file';
import pageDown from 'pagedown'; // Markdown processor used by Stack 

let zip,
	rawQuotes,
	alfredJSONList,
	rawAlfredJSON = [],
	physorgJSON = [],
	gplusJSON = [];

const
	markdownConverter = pageDown.getSanitizingConverter();

function fetchAlfredJSONList() {
	return new Promise((resolve, reject) => {
		fs.readdir(alfred.output.raw, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(removeSystemFiles(files));
			}
		})	
	});
}

function loadAllAlfredJSON() {
	return new Promise((resolve, reject) => {
		const
			total = alfredJSONList.length;

		let read = (count) => {
			const
				jsonPath = alfredJSONList[count];

			console.log('Reading ' + jsonPath + ' ...');

			loadJSONFile(jsonPath)

				.then(json => {
					++count;

					if (count === total) {
						resolve();
					} else {
						rawAlfredJSON.push(json);
						read(count);
					}
				});
		}

		read(0);
	});
}

function processRawAlfredJSON() {
	return new Promise((resolve, reject) => {
		rawAlfredJSON.forEach(quote => {
			let quoteName = quote['alfredsnippet']['name'],
				quoteKeyword = quote['alfredsnippet']['keyword'],
				quoteSnippet = quote['alfredsnippet']['snippet'];

			// Remove any continuation indicators from snippets
			// These only occur in the phys.org posts
			quoteSnippet = quoteSnippet.replace('(cont\'d)\n\n', '');
			quoteSnippet = quoteSnippet.replace('\n\n(cont\'d)', '');

			if (quoteName.match(/^Phys\.org Post - /)) {
				// Remove any prefixes from the names
				quoteName = quoteName.replace('Phys.org Post - ', '');

				// Remove keyword prefix that was used to specify
				// that this is a Phys.org-formatted snippet
				quoteKeyword = quoteKeyword.replace(/^pp\s/, '');
				
				physorgJSON.push({
					id: createSlug(quoteName),
					quoteName: quoteName,
					keyword: quoteKeyword,
					quoteParagraph: quoteSnippet
				});
			} else if (quoteName.match(/^G\+ Post - /)) {
				// Remove any prefixes from the names
				quoteName = quoteName.replace('G+ Post - ', '');

				// Remove keyword prefix that was used to specify
				// that this is a G+-formatted snippet
				quoteKeyword = quoteKeyword.replace(/^gp\s/, '');

				gplusJSON.push({
					id: createSlug(quoteName),
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
	new Promise((resolve, reject) => {
		fs.writeFile(alfred.output.gplus,
			JSON.stringify(gplusJSON),
			"utf8",
			() => resolve());
	});
}

function saveAlfredPhysorgJSON() {
	new Promise((resolve, reject) => {
		fs.writeFile(alfred.output.physorg,
			JSON.stringify(physorgJSON),
			"utf8",
			() => resolve());
	});
}

console.log('Unzipping Alfred snippets export ...')

new Promise((resolve, reject) => {
	resolve(new AdmZip(alfred.input));
})

// Alfred Snippet exports are stored as a set of zipped JSON files
.then((zip) => {
	new Promise((resolve, reject) => {
		resolve(zip.extractAllTo(alfred.output.raw, true));
	})
})

.then(() => {
	console.log('\nFetching the list of raw Alfred JSON files ...');

	return fetchAlfredJSONList();
})

.then((json) => {
	alfredJSONList = json.map(path => alfred.output.raw + '/' + path);

	console.log('\nFetching all generated JSON ...\n');

	return loadAllAlfredJSON();
})

.then(() => {
	console.log('\nProcessing the raw Alfred JSON ...');

	return processRawAlfredJSON();
})

.then(() => {
	console.log('\nSaving the processed JSON to the output ' +
		alfred.output.gplus);

	return saveAlfredGplusJSON();
})

.then(() => {
	console.log('\nSaving the processed JSON to the output ' +
		alfred.output.physorg);

	return saveAlfredPhysorgJSON();
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
