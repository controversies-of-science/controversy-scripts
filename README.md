# Controversies of Science API Scripts

This is a set of scripts which populate both the Controversies of Science /cards and /feeds API backend endpoints.

This repo does not require any database or direct interactions with a database.  All interactions with the AWS dynamoDB backend occur through AWS API gateways:

- [aws-lambda-worldviewer-cards-api](https://github.com/controversies-of-science/aws-lambda-worldviewer-cards-api)
- [aws-lambda-worldviewer-feeds-api](https://github.com/controversies-of-science/aws-lambda-worldviewer-feeds-api)

The [react-worldviewer-app](https://github.com/controversies-of-science/react-worldviewer-app) frontend is the intended recipient of this data.  In particular, `aws-lambda-worldviewer-cards-api` and `aws-lambda-worldviewer-feeds-api` must both be populated in order for the homepage search result links at [https://www.controversiesofscience.com](https://www.controversiesofscience.com) to work.

These four repositories are all necessary to translate the G+ Controversies of Science collection to the Controversies of Science site.

## Controversy Card Metadata

Successful scraping of the Controversies of Science collection requires that the Google+ API key environment variables are set.

Access to the G+ API requires an API key from Google.  For more information on how to do that, go here:

    https://developers.google.com/+/web/api/rest/oauth

The scrape script assumes that you have two environmental key variables set, and will only perform the G+ scrape if valid values are provided for these two keys:

    export GPLUS_USER_ID='<a long number>'
    export GPLUS_API_KEY='<a long alphanumeric string>'

These would be set in a file like `.profile` or `.bash_profile` in your root (if you are using a Linux-based machine).

## S3 Uploads

Any script which involves a non-deploy upload to S3 will require access to programmatic AWS credentials (typically stored in text file at `~/.aws/credentials`).  These S3-based scripts will check for a profile there named `controversy`.

It's also important to properly set the IAM policy for the user that corresponds to that key:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "s3:*",
                "Resource": "*"
            }
        ]
    }

The S3 bucket itself should have the policy:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowPublicRead",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::controversy-cards-images/*"
            }
        ]
    }

## Build

Any changes made to the scripts need to be built with Babel before running:

`npm run build`

## The Scripts

Plural scripts are seed scripts which operate on entire collections.  Any pre-existing data will be wiped out.  The singular versions are additive to what already exists (the atomic versions).

### G+ Collection Scrapers

When starting from scratch, these are the first scripts which should be run.

#### scrape-gplus-directories (DONE)

`npm run scrape-gplus-directories` - This script scaffolds out the controversy card directories based upon the structure of the Controversies of Science G+ collection.  **Since the other scripts will assume these directories exist, this script should be run before any other card-based script.**

#### scrape-gplus-data (DONE)

`npm run scrape-gplus-data` - This script transforms the Controversies of Science G+ collection online into a JSON file located at `/json/generated/gplus-collection.json`.  Beware: It will completely wipe out whatever data is already in that `gplus-collection.json` file.  A more atomic version of this script will be created later.

#### scrape-gplus-images (DONE)

`npm run scrape-gplus-images` - This script saves to disk from the G+ collection all of the large-format controversy card images used in the collection. **Note that there appears to be a problem with the G+ API insofar as many of the large-format images are actually just copies of their smaller thumbnail-like images. They somehow stored the wrong data, and for this reason all of these images come from my own AWS S3 bucket.**

### Algolia Search Result Generator Scripts

These scripts assume that the G+ scraper script has already captured the G+ collection data, and they are currently pointed at CloudFront edges.

Once the new JSON is generated, go to the Algolia index, click "Manage Current Index", "Clear", then add **both** the `json/generated/algolia-cards.json` and `json/generated/algolia-feeds.json` files to the same new index.

#### create-algolia-cards (DONE)

`npm run create-algolia-cards` - This script generates the Algolia Search JSON for all controversy cards from scratch, based upon two inputs:

- `/json/inputs/cards.json` - a hand-generated list of slugs and values for the cards
- `/json/generated/gplus-collection.json` - the output of the `scrape-gplus` script

#### create-algolia-feeds (DONE)

`npm run create-algolia-feeds` - Since Algolia Search must generate results for both cards and feeds, this script generates the Algolia feed JSON.  It combines two inputs:

- `/json/inputs/feeds.json` - a hand-generated list of slugs and values for the feeds
- `/md/feeds/` - This directory is scanned for subdirectories of the structure `/{controversy-slug}/{feed-slug}`, and the markup is processed for front matter and split by paragraphs, as required by Algolia Search.

### DynamoDB API Backend Seed Scripts

These scripts assume that the G+ scraper script has already captured the G+ collection data.

#### create-dynamo-cards (DONE)

`npm run create-dynamo-cards` - This resets the controversy cards endpoint which is used by the `react-worldviewer-app` application.  Be aware that the cards are pushed into the backend one at a time.

This script creates significant load on the dynamoDB backend when there is more than just a few items to post, and it is advisable to set the read and write capacity units to at least 25 and 50, accordingly (with auto-scaling set to 50).

#### create-dynamo-feeds (DONE)

`npm run create-dynamo-feeds` - This resets the controversy feeds endpoint which is used by the `react-worldviewer-app` application.  Be aware that the feeds are pushed into the backend one at a time.

I really don't know if these categories inside of the feeds markdown front matter will be of any real use; it could be more hassle than anything.

### Thumbnail Generator Scripts

These scripts assume that the large-format images already exist.

#### create-card-thumbnails (DONE)

`npm run create-card-thumbnails` - This generates card thumbnails based upon the contents of `img/cards`.  See `src/es6/libs/config.es` for the thumbnail width setting.  For the time being, we will manage the S3 bucket manually.

#### create-feed-thumbnails (DONE)

`npm run create-feed-thumbnails` - This generates feed thumbnails based upon the contents of `img/feeds`.  See `src/es6/libs/config.es` for the thumbnail width setting.  For the time being, we will manage the S3 bucket manually.

### Openseadragon Image Pyramid Generator Scripts

These scripts assume that the large-format images already exist.

#### create-card-pyramids (LATER)

`npm run create-card-pyramids` - This generates image pyramids based upon the contents of `img/cards`.  Be aware that this script can take a significant amount of time to complete.

#### create-feed-pyramids (LATER)

`npm run create-feed-pyramids` - This generates image pyramids based upon the contents of `img/feeds`.  Be aware that this script can take a significant amount of time to complete.

### Alfred Quotes Import Script

Alfred is a popular automation tool that comes with an ability to create snippets which can be quickly invoked from any Mac app with a keyboard shortcut.  The quotes can be exported, and this script automates the production of a single properly-formatted JSON file which can be subsequently imported into Algolia search.  These appear in search results as quotes -- which are not necessarily associated with any particular controversy card or feed.  In some cases, the quotes are redundant of existing card material, but alternatively, it can also be information which will eventually become a card or feed.

#### create-alfred-json (DONE)

Assumes you have exported your Alfred snippets to a file in `/alfred` (the filename is currently hardcoded in `config.js` to `alfred/ScienceQuotes.alfredsnippets`).  It saves the final JSON file into `json/generated/`.

`npm run create-alfred-json` - Generates two sets of quotes -- one set where the quotes are all formatted for phys.org and a second where the quotes are formatted for G+ (markdown).

### S3 Image Deployments

`package.json` includes:

    "predeploy": "npm run build",
    "deploy-card-images": "aws s3 sync img/cards/ s3://controversy-card-images",
    "deploy-feed-images": "aws s3 sync img/feeds/ s3://controversy-card-feeds",
    "postdeploy": "aws cloudfront create-invalidation --distribution-id E17HLY6C4048N2 --paths '/*'",

These two scripts upload **all** images associated with **all** cards and feeds.  Since this is a very large amount of data, it's generally recommended to upload images by category.

#### deploy-card-images (DONE)
#### deploy-feed-images (DONE)

**These commands exist, but have yet to be tested**.  I'm going to wait until after the conference to test them, because these are huge uploads and I believe that everything -- except the thumbnails (the smallest part) -- are done.  I'll just use FTP to do that.

#### deploy-card-thumbnails (DONE)
#### deploy-feed-thumbnails (DONE)

**These two commands exhibit a strange one-off error: No matter what I do to give the AWS credentials the time they need, the first transfer always fails.**  I've not been able to figure out why so far.

#### postdeploy-card-images (DONE)
#### postdeploy-feed-images (DONE)

These invalidate the CloudFront caches to speed up propagation.

As needs arise, I'll fill out the other upload scripts.

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
