import { ConfigService } from '@nestjs/config';
import { DynamoClient } from '@whatchangedfor/shared/dynamodb';
import {
  AbilityChange,
  ApiDataResponse,
  ApiPatchResponse,
  HeroChanges,
  Patch,
  PatchNote,
  PatchNotes,
  RawAbilityChange,
  Reference,
} from '@whatchangedfor/shared/interfaces';
import {
  ABILITY_LIST_URL,
  HERO_LIST_URL,
  ITEM_LIST_URL,
  LAST_VERSION_PATCHED,
  PATCH_LIST_URL,
  SPECIFIC_PATCH_URL,
  UNKNOWN_TOKEN,
} from './parser.constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ParserService {
  private readonly dynamoClient: DynamoClient;

  private heroList: Reference[] = [];
  private itemList: Reference[] = [];
  private abilityList: Reference[] = [];
  private patchList: Patch[] = [];

  constructor(private readonly configService: ConfigService) {
    this.dynamoClient = new DynamoClient(
      this.configService.get<string>(`DYNAMODB_TABLE`)
    );
  }

  /**
   * Contains the entire patch parsing logic.
   * Queries the datafeed APIs and dynamodb to figure out
   * which patches are available and which have already been patched
   * then parses the missing ones
   *
   * @returns the number of patches parsed
   */
  public async parse(): Promise<number> {
    await this.prepareData();

    const latestVersionParsed = (await this.dynamoClient.get(
      LAST_VERSION_PATCHED
    )) as unknown as {
      patch: string;
      created_at: string;
      id: 'latestVersionParsed';
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

    return this.patchList.length;
  }

  private async parsePatch(patch: Patch) {
    const patchNotes = (await (
      await fetch(SPECIFIC_PATCH_URL(patch.patch_number))
    ).json()) as PatchNotes;

    let itemChanges: HeroChanges[] = [];
    let heroChanges: HeroChanges[] = [];

    if (patchNotes.heroes) {
      heroChanges = patchNotes.heroes.map((hero) => {
        const heroName = this.lookupReference(hero.hero_id, this.heroList);

        return {
          name: heroName ?? UNKNOWN_TOKEN,
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
    }

    if (patchNotes.items) {
      if (patchNotes.neutral_items) {
        patchNotes.items = [...patchNotes.items, ...patchNotes.neutral_items];
      }
      itemChanges = patchNotes.items.map((item) => {
        const itemName = this.lookupReference(item.ability_id, this.itemList);

        return {
          name: itemName ?? UNKNOWN_TOKEN,
          generalChanges: this.parseSimpleChanges(item.ability_notes),
        };
      });
    }

    const savePromises = [...heroChanges, ...itemChanges].map((hero) =>
      this.saveChangesToDynamo(hero, patch)
    );

    await Promise.all(savePromises);

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
      const abilityName = this.lookupReference(
        changes.ability_id,
        this.abilityList
      );

      return {
        name: abilityName ?? 'Unknown Ability',
        changes: changes.ability_notes.map((note) => note.note),
      };
    });
  }

  private parseSimpleChanges(notes: PatchNote[]): string[] {
    return notes.filter((n) => n.hide_dot !== true).map((note) => note.note);
  }

  private lookupReference(id: number, referenceList: Reference[]) {
    const name = referenceList.find(
      (reference) => reference.id === id
    )?.name_english_loc;

    if (!name) {
      console.warn(`Change detected for nonexisting reference:`, { id });
    }

    return name;
  }

  private toSnakeCase(toSnake: string): string {
    return toSnake
      .toLowerCase()
      .replaceAll(` `, `_`)
      .replaceAll(/[^a-z_]/g, ``);
  }

  private async prepareData() {
    this.heroList = (
      (await (await fetch(HERO_LIST_URL)).json()) as ApiDataResponse
    ).result.data.heroes;
    this.itemList = (
      (await (await fetch(ITEM_LIST_URL)).json()) as ApiDataResponse
    ).result.data.itemabilities;
    this.patchList = (
      (await (await fetch(PATCH_LIST_URL)).json()) as ApiPatchResponse
    ).patches;
    this.abilityList = (
      (await (await fetch(ABILITY_LIST_URL)).json()) as ApiDataResponse
    ).result.data.itemabilities;
  }
}
