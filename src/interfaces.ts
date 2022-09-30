export interface Patch {
  patch_number: string;
  patch_timestamp: number;
}

export interface RawAbilityChange {
  ability_id: number;
  ability_notes: PatchNote[];
}
[];

export interface PatchNote {
  note: string;
}

export interface RawHeroChange {
  hero_id: number;
  hero_notes?: PatchNote[];
  abilities?: RawAbilityChange[];
  talent_notes?: PatchNote[];
}

export interface PatchNotes {
  heroes: RawHeroChange[];
}

export interface Hero {
  id: number;
  name_english_loc: string;
}

export interface Ability {
  id: number;
  name_english_loc: string;
}

export interface HeroChanges {
  name: string;
  generalChanges?: string[];
  abilityChanges?: AbilityChange[];
  talentChanges?: string[];
}

export type AbilityChange = {
  name: string;
  changes: string[];
};
