export interface HeroName {
  humanName: string;
  technicalName: string;
  nicknames: string[];
}

export function isHeroName(heroName: any): heroName is HeroName {
  if (
    "humanName" in heroName &&
    "technicalName" in heroName &&
    "nicknames" in heroName
  ) {
    if (
      typeof heroName.humanName === "string" &&
      typeof heroName.technicalName === "string" &&
      Array.isArray(heroName.nicknames)
    ) {
      if (heroName.nicknames.length === 0) {
        return true;
      }
      return (heroName.nicknames as string[]).every(
        (value) => typeof value === "string"
      );
    }
  }

  return false;
}
