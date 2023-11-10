import { HeroChanges } from '@whatchangedfor/shared/interfaces';

export interface ParsedChanges {
  changedItems: ChangedItem[];
}

interface ChangedItem {
  id: string;
  changes: {
    patch: string;
    changes: HeroChanges[];
  }[];
}
