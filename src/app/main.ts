import { APIGatewayEvent } from 'aws-lambda';
import express from 'express';
import ServerlessHttp from 'serverless-http';
import { DynamoClient } from '../dynamodb/dynamodb.client';
import { AbilityChanges, HeroChanges } from '../parser/parser';

interface DynamoHero {
  version: string;
  id: string;
  generalChanges: string[];
  abilityChanges: AbilityChanges;
  talentChanges: string[];
}

type HeroChangeList = {
  name: string;
  changes: Record<string, Omit<HeroChanges, `name`>>;
};

const app = express();

app.set(`view engine`, `pug`);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('*', async (req, res) => {
  const heroName = req.path.replaceAll(`/`, ``);

  const changeSet = await hero(heroName);

  res.render(`hero`, { changeSet });
});

export const serverlessApp = ServerlessHttp(app);

export async function hero(heroName: string) {
  const dynamoClient = new DynamoClient();

  if (!heroName) {
    throw Error('No heroname provided');
  }

  const rawHeroChanges = (await dynamoClient.get(heroName)) as DynamoHero[];

  return rawHeroChanges.reduce<HeroChangeList>(
    (acc: HeroChangeList, changes: DynamoHero) => {
      const { id, version, ...changeSet } = changes;

      acc.changes = {
        [version]: changeSet,
        ...acc.changes,
      };

      return acc;
    },
    {
      name: heroName,
      changes: {},
    }
  );
}
