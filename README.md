# What changed for {your favorite Dota 2 hero}

[whatchangedfor.com](https://www.whatchangedfor.com/pudge) is a Dota 2 changelog tracker for individual heroes.

It has two parts:

- **The website** that displays changelogs for individual heroes across all patches.

- **The parser** that runs on a schedule and tries to read patchnotes from the official Dota 2 site. This will ensure that any new patch will automatically be added to the site within hours

## Development

### Setup

We're running Yarn with Zero-Installs so no `yarn install` needed!

### Test

```
yarn test
```

### Run

```
yarn start
```

### Deploy

```
yarn deploy:<env>
```

## Hero names

The app is designed to handle nicknames and different formats of hero names, while still being able to handle new heroes without

The current setup has the list of hero names in a CSV file to make it easy to edit. After making changes it needs to be converted to a `.json` file with the `yarn run generate-names` command.
