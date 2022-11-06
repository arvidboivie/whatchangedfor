# What Changed For

[whatchangedfor.com](https://www.whatchangedfor.com/pudge) is a Dota 2 changelog tracker for individual heroes.

## Development

### Setup

```
npm install
```

### Run

```
npm run offline
```

## Hero names

The current setup has the list of hero names in a CSV file to make it easy to edit. To update hero names run `npm run generate-names` and add the resulting array to `src/shared/hero-names.ts`. I will probably update this to create a JSON and automatically load it (or something) in the future.
