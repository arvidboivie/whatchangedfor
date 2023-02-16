// Enable Yarn PnP
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
require("../../.pnp.cjs").setup();

import fetch from "node-fetch";
import { DynamoClient } from "../dynamodb/dynamodb.client";
import {
  Ability,
  RawAbilityChange,
  Hero,
  Patch,
  PatchNotes,
  HeroChanges,
  AbilityChange,
  PatchNote,
} from "../interfaces";

const BASE_URL = `https://www.dota2.com/datafeed`;
const PATCH_LIST_URL = `${BASE_URL}/patchnoteslist?language=english`;
const HERO_LIST_URL = `${BASE_URL}/herolist?language=english`;
const ABILITY_LIST_URL = `${BASE_URL}/abilitylist?language=english`;
const SPECIFIC_PATCH_URL = (version: string) =>
  `${BASE_URL}/patchnotes?version=${version}&language=english`;

const LAST_VERSION_PATCHED = `latestVersionParsed`;

class PatchNoteParser {
  private readonly dynamoClient: DynamoClient;

  private heroList: Hero[] = [];
  private patchList: Patch[] = [];
  private abilityList: Ability[] = [];

  constructor() {
    this.dynamoClient = new DynamoClient();
  }

  public async parse() {
    await this.prepareData();

    const latestVersionParsed = (await this.dynamoClient.get(
      LAST_VERSION_PATCHED
    )) as unknown as {
      patch: string;
      created_at: string;
      id: "latestVersionParsed";
    }[];

    if (latestVersionParsed[0]) {
      const patchIndex = this.patchList.findIndex(
        (patch) => patch.patch_number === latestVersionParsed[0].patch
      );

      this.patchList = this.patchList.slice(patchIndex + 1);
    }

    for (const patch of this.patchList) {
      await this.parsePatch(patch);
    }

    console.log(
      `Done! Parsed ${this.patchList.length} patches`,
      this.patchList
    );
  }

  private async parsePatch(patch: Patch) {
    const patchNotes = (await (
      await fetch(SPECIFIC_PATCH_URL(patch.patch_number))
    ).json()) as PatchNotes;

    if (patchNotes.heroes) {
      const heroChanges: HeroChanges[] = patchNotes.heroes.map((hero) => {
        return {
          name: this.lookupHeroName(hero.hero_id),
          generalChanges: hero.hero_notes
            ? this.parseSimpleChanges(hero.hero_notes)
            : undefined,
          abilityChanges: hero.abilities
            ? this.parseAbilityChanges(hero.abilities)
            : undefined,
          talentChanges: hero.talent_notes
            ? this.parseSimpleChanges(hero.talent_notes)
            : undefined,
        };
      });

      const savePromises = heroChanges.map((hero) =>
        this.saveChangesToDynamo(hero, patch)
      );

      await Promise.all(savePromises);
    }

    await this.tagPatchAsParsed(patch);
  }

  private saveChangesToDynamo(hero: HeroChanges, patch: Patch) {
    const { name, ...changes } = hero;
    return this.dynamoClient.put(this.toSnakeCase(name), patch.patch_number, {
      patchDate: patch.patch_timestamp,
      ...changes,
    });
  }

  private tagPatchAsParsed(patch: Patch) {
    return this.dynamoClient.put(LAST_VERSION_PATCHED, LAST_VERSION_PATCHED, {
      patch: patch.patch_number,
    });
  }

  private parseAbilityChanges(abilities: RawAbilityChange[]): AbilityChange[] {
    return abilities.map((changes) => {
      return {
        name: this.lookupAbilityName(changes.ability_id),
        changes: changes.ability_notes.map((note) => note.note),
      };
    });
  }

  private parseSimpleChanges(notes: PatchNote[]): string[] {
    return notes.map((note) => note.note);
  }

  private lookupHeroName(heroId: number): string {
    const name = this.heroList.find(
      (hero) => hero.id === heroId
    )?.name_english_loc;

    if (!name) {
      throw Error(`Change detected for nonexisting hero`);
    }

    return name;
  }

  private lookupAbilityName(abilityId: number): string {
    const name = this.abilityList.find(
      (ability) => ability.id === abilityId
    )?.name_english_loc;

    if (!name) {
      throw Error(`Change detected for nonexisting ability`);
    }

    return name;
  }

  private toSnakeCase(toSnake: string): string {
    return toSnake.toLowerCase().replaceAll(` `, `_`);
  }

  private async prepareData() {
    this.heroList = (
      await (await fetch(HERO_LIST_URL)).json()
    ).result.data.heroes;
    this.patchList = (await (await fetch(PATCH_LIST_URL)).json()).patches;
    this.abilityList = (
      await (await fetch(ABILITY_LIST_URL)).json()
    ).result.data.itemabilities;
  }
}

export const parse = () => {
  new PatchNoteParser().parse();
};
