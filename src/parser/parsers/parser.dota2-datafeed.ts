import {
  HeroListResponse,
  ItemListResponse,
  PatchNotes,
  Reference,
} from "../../interfaces";
import { FetchService } from "../fetch.service";

interface ChangeUnit {
  unitName: string;
  changes?: string[];
}

interface HeroChanges extends ChangeUnit {
  abilityChanges: ChangeUnit[];
}

enum ReferenceType {
  HERO = "HERO",
  ITEM = "ITEM",
  ABILITY = "ABILITY",
}

export interface Parser {
  parse: (version: string) => Promise<ChangeUnit[]>;
}

export class ParserDota2Datafeed implements Parser {
  private readonly BASE_URL = `https://www.dota2.com/datafeed`;
  private readonly HERO_LIST_URL = `${this.BASE_URL}/herolist?language=english`;
  private readonly ITEM_LIST_URL = `${this.BASE_URL}/itemlist?language=english`;
  private readonly ABILITY_LIST_URL = `${this.BASE_URL}/abilitylist?language=english`;

  private readonly fetchService: FetchService;

  constructor() {
    this.fetchService = new FetchService();
  }

  private readonly SPECIFIC_PATCH_URL = (version: string) =>
    `${this.BASE_URL}/patchnotes?version=${version}&language=english`;

  private _references?: Record<ReferenceType, Reference[]>;

  private get references(): Record<ReferenceType, Reference[]> {
    if (!this._references) {
      throw Error(
        "References not available. You need to await setup() before running parse"
      );
    }

    return this._references;
  }

  private set references(value: Record<ReferenceType, Reference[]>) {
    this._references = value;
  }

  public async setup(): Promise<void> {
    this.references = await this.getReferences();
  }

  public async parse(version: string): Promise<ChangeUnit[]> {
    const patchNotes = await this.fetchService.fetch<PatchNotes>(
      this.SPECIFIC_PATCH_URL(version)
    );

    const changes: ChangeUnit[] = [];

    if (patchNotes.heroes) {
      changes.push(
        ...patchNotes.heroes.map((hero) => ({
          unitName: this.lookupReference(hero.hero_id, ReferenceType.HERO),
          changes: hero.hero_notes?.map((note) => note.note),
        }))
      );
    }

    if (patchNotes.items) {
      changes.push(
        ...patchNotes.items.map((item) => ({
          unitName: this.lookupReference(item.ability_id, ReferenceType.ITEM),
          changes: item.ability_notes?.map((note) => note.note),
        }))
      );
    }

    return changes;
  }

  private lookupReference(id: number, type: ReferenceType): string {
    const name = this.references[type].find(
      (reference) => reference.id === id
    )?.name_english_loc;

    if (!name) {
      throw Error(
        `Change detected for nonexisting reference: ${id} for type ${type}`
      );
    }

    return name;
  }

  private async getReferences(): Promise<Record<ReferenceType, Reference[]>> {
    return {
      [ReferenceType.HERO]: (
        await this.fetchService.fetch<HeroListResponse>(this.HERO_LIST_URL)
      ).result.data.heroes,
      [ReferenceType.ITEM]: (
        await this.fetchService.fetch<ItemListResponse>(this.ITEM_LIST_URL)
      ).result.data.itemabilities,
      [ReferenceType.ABILITY]: (
        await this.fetchService.fetch<ItemListResponse>(this.ABILITY_LIST_URL)
      ).result.data.itemabilities,
    };
  }
}
