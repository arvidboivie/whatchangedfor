// Enable Yarn PnP
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
require('../../.pnp.cjs').setup();

import express from 'express';
import { readFileSync } from 'fs';
import ServerlessHttp from 'serverless-http';
import { DynamoClient } from '@whatchangedfor/shared/dynamodb';
import { AbilityChange, HeroChanges } from '@whatchangedfor/shared/interfaces';
import { HeroName } from './app/hero.interfaces';
import { HeroService } from './app/hero.service';
import hbs from 'hbs';

interface DynamoHero {
  version: string;
  id: string;
  generalChanges: string[];
  abilityChanges: AbilityChange[];
  talentChanges: string[];
  patchDate: string;
}

type HeroChangeList = {
  name: string;
  changes: Omit<HeroChanges, `name`> & { version: string; patchDate: string }[];
};

const heroNames: HeroName[] = JSON.parse(
  readFileSync(`${__dirname}/../../resources/hero-data.json`).toString()
);

const app = express();

app.set(`view engine`, `hbs`);
app.set(`views`, `${__dirname}/../assets`);

hbs.registerPartials(`${__dirname}/../assets/partials`);

app.get('/', (_req, res) => {
  res.render(`main`, {
    heroNames: heroNames.map((heroName) => heroName.humanName),
  });
});

app.get('*', async (req, res) => {
  const searchString = req.path.replaceAll(`/`, ``);

  const heroName = new HeroService(heroNames).getNameFor(searchString);

  if (heroName !== undefined) {
    const changeSet = await hero(heroName);

    res.render(`hero`, {
      changeSet,
      heroNames: heroNames.map((heroName) => heroName.humanName),
    });
    return;
  }

  res.redirect('/');
});

export const serverlessApp = ServerlessHttp(app);

export async function hero(heroName: HeroName) {
  const dynamoClient = new DynamoClient(process.env.DYNAMODB_TABLE as string);

  if (!heroName) {
    throw Error('No heroname provided');
  }

  const rawHeroChanges = (await dynamoClient.get(
    heroName.technicalName
  )) as DynamoHero[];

  return rawHeroChanges.reverse().reduce<HeroChangeList>(
    (acc: HeroChangeList, changes: DynamoHero) => {
      const { version, patchDate, ...changeSet } = changes;

      const date = new Date(Number(patchDate) * 1000);

      acc.changes.push({
        version,
        patchDate: `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`,
        ...changeSet,
      });

      return acc;
    },
    {
      name: heroName.humanName,
      changes: [],
    }
  );
}
