import { HeroName } from '../src/app/hero.interfaces';

export const MockHeroes = {
  AntiMage: {
    technicalName: 'anti-mage',
    humanName: 'Anti-Mage',
    nicknames: ['AM', 'andy', 'Magina'],
  },
  CentaurWarrunner: {
    technicalName: 'centaur_warrunner',
    humanName: 'Centaur Warrunner',
    nicknames: ['Centaur', 'Kentaur', 'Kenta'],
  },
  CrystalMaiden: {
    technicalName: 'crystal_maiden',
    humanName: 'Crystal Maiden',
    nicknames: ['CM', 'Rylai'],
  },
  ChaosKnight: {
    technicalName: 'chaos_knight',
    humanName: 'Chaos Knight',
    nicknames: ['CK'],
  },
  Pudge: {
    technicalName: 'pudge',
    humanName: 'Pudge',
    nicknames: [],
  },
};

export const MockHeroesList: HeroName[] = [
  MockHeroes.AntiMage,
  MockHeroes.CentaurWarrunner,
  MockHeroes.CrystalMaiden,
  MockHeroes.ChaosKnight,
  MockHeroes.Pudge,
];
