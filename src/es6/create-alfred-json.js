import AdmZip from 'adm-zip';
import fs from 'fs';
import { dir } from './libs/config';

let zip, rawQuotes;

new Promise((resolve, reject) => {
	resolve(new AdmZip(dir.alfred));
})

// Alfred Snippet exports are stored as a set of zipped JSON files
.then((zip) => {
	zip.extractAllTo('alfred/json', true);
})

.catch(error => {
	console.log("\nAn error has occurred ...");

	if (error) {
		console.log(error);
	}
});
