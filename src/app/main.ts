import express from 'express';
import { readFileSync } from 'fs';
import ServerlessHttp from 'serverless-http';
import { DynamoClient } from '../dynamodb/dynamodb.client';
import { AbilityChange, HeroChanges } from '../interfaces';
import { HeroName } from './hero.interfaces';
import { HeroService } from './hero.service';

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

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.get('*', async (req, res) => {
  const searchString = req.path.replaceAll(`/`, ``);

  const heroName = new HeroService(heroNames).getNameFor(searchString);

  if (heroName !== undefined) {
    const changeSet = await hero(heroName);

    res.render(`hero`, { changeSet });
    return;
  }

  res.redirect('/');
});

export const serverlessApp = ServerlessHttp(app);

export async function hero(heroName: HeroName) {
  const dynamoClient = new DynamoClient();

  if (!heroName) {
    throw Error('No heroname provided');
  }

  const rawHeroChanges = (await dynamoClient.get(
    heroName.technicalName
  )) as DynamoHero[];

  return rawHeroChanges.reverse().reduce<HeroChangeList>(
    (acc: HeroChangeList, changes: DynamoHero) => {
      const { id, version, patchDate, ...changeSet } = changes;

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
