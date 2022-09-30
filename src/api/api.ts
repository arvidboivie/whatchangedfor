import { APIGatewayEvent } from 'aws-lambda';
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

export async function hero(event: APIGatewayEvent) {
  const dynamoClient = new DynamoClient();

  const heroName = event.pathParameters?.hero;

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
