# Controversies of Science API Scripts

This is a set of scripts which populate both the Controversies of Science /cards and /feeds API backend endpoints.

This repo does not require any database or direct interactions with a database.  All interactions with the AWS dynamoDB backend occur through AWS API gateways:

- [aws-lambda-worldviewer-cards-api](https://github.com/controversies-of-science/aws-lambda-worldviewer-cards-api)
- [aws-lambda-worldviewer-feeds-api](https://github.com/controversies-of-science/aws-lambda-worldviewer-feeds-api)

## Controversy Card Metadata

Successful scraping of the Controversies of Science collection requires that the Google+ API key environment variables are set.

Access to the G+ API requires an API key from Google.  For more information on how to do that, go here:

    https://developers.google.com/+/web/api/rest/oauth

The scrape script assumes that you have two environmental key variables set, and will only perform the G+ scrape if valid values are provided for these two keys:

    export GPLUS_USER_ID='<a long number>'
    export GPLUS_API_KEY='<a long alphanumeric string>'

These would be set in a file like `.profile` or `.bash_profile` in your root (if you are using a Linux-based machine).

## Build

Any changes made to the scripts need to be built with Babel before running:

`npm run build`

## The Scripts

Plural scripts are seed scripts which operate on entire collections.  Any pre-existing data will be wiped out.  The singular versions are additive to what already exists (the atomic versions).

### scrape-gplus

`npm run scrape-gplus` - This script transforms the Controversies of Science G+ collection online into a JSON file located at `/json/generated/gplus-collection.json`.

### create-algolia-cards

`npm run create-algolia-cards` - This script generates the Algolia Search JSON for all controversy cards from scratch, based upon two inputs:

- `/json/inputs/cards.json` - a hand-generated list of slugs and values for the cards
- `/json/generated/gplus-collection.json` - the output of the `scrape-gplus` script

### create-algolia-feeds

`npm run create-algolia-feeds` - Since Algolia Search must generate results for both cards and feeds, this script generates the Algolia feed JSON.

### create-dynamo-cards

`npm run create-dynamo-cards` - This resets the controversy cards endpoint which is used by the `react-worldviewer-app` application.

### create-dynamo-feeds

`npm run create-dynamo-feeds` - This resets the controversy feeds endpoint which is used by the `react-worldviewer-app` application.

### create-card-thumbnails

`npm run create-card-thumbnails` - This generates card thumbnails based upon the contents of `img/cards`.  See `src/es6/libs/config.es` for the thumbnail width setting.

### create-feed-thumbnails

`npm run create-feed-thumbnails` - This generates feed thumbnails based upon the contents of `img/feeds`.  See `src/es6/libs/config.es` for the thumbnail width setting.

### create-card-pyramids

`npm run create-card-pyramids` - This generates image pyramids based upon the contents of `img/cards`.  Be aware that this script can take a significant amount of time to complete.

### create-feed-pyramids

`npm run create-feed-pyramids` - This generates image pyramids based upon the contents of `img/feeds`.  Be aware that this script can take a significant amount of time to complete.

## TODO

- Implement S3 upload
- Create singular versions which can operate on just one card or feed

## Controversies of Science Source

The cards are broken down into 6 categories:

- *ongoing* - Recent, ongoing controversies
- *historical* - Controversies possibly still at play, but more historical in nature
- *person* - Some people you should know about + character studies
- *reform* - Relevant to academic reform and redesigning scientific discourse
- *critique* - The best critical commentary ever published for modern science
- *thinking* - How to think like a scientist about controversies

The data is scraped from my Google Plus collection, here:

*Controversies of Science* - https://plus.google.com/collection/Yhn4Y
