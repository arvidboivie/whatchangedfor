import { HeroName } from './hero.interfaces';

export class HeroService {
  private readonly heroNames: HeroName[];

  constructor(heroNames: HeroName[]) {
    this.heroNames = heroNames;
  }

  public getNameFor(searchName: string): HeroName {
    const nameMatch = this.heroNames.find((name) => {
      if (this.compareNames(name.humanName, searchName)) {
        return true;
      }

      if (this.compareNames(name.technicalName, searchName)) {
        return true;
      }

      if (
        name.nicknames.some((nickname) =>
          this.compareNames(nickname, searchName)
        )
      ) {
        return true;
      }
    });

    return nameMatch
      ? nameMatch
      : {
          humanName: searchName,
          technicalName: searchName,
          nicknames: [],
        };
  }

  private compareNames(nameA: string, nameB: string): boolean {
    return (
      nameA.toLowerCase().replaceAll(/[^a-zA-Z]/g, '') ===
      nameB.toLowerCase().replaceAll(/[^a-zA-Z]/g, '')
    );
  }
}
