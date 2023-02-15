import { MockHeroes, MockHeroesList } from "../../__mocks__/mock.heroes";
import { HeroService } from "./hero.service";

describe("hero.service.ts", () => {
  describe("getHeroName", () => {
    const heroService: HeroService = new HeroService(MockHeroesList);

    it.each([
      {
        searchText: "pudge",
        expected: MockHeroes.Pudge,
      },
      {
        searchText: "chaos_knight",
        expected: MockHeroes.ChaosKnight,
      },
      {
        searchText: "anti-mage",
        expected: MockHeroes.AntiMage,
      },
    ])(
      "should return names of the hero if searchName is technical name",
      ({ searchText, expected }) => {
        expect(heroService.getNameFor(searchText)).toEqual(expected);
      }
    );

    it.each([
      {
        searchText: "CK",
        expected: MockHeroes.ChaosKnight,
      },
      {
        searchText: "Rylai",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "Kenta",
        expected: MockHeroes.CentaurWarrunner,
      },
    ])(
      "should return names of the hero if searchName is nickname",
      ({ searchText, expected }) => {
        expect(heroService.getNameFor(searchText)).toEqual(expected);
      }
    );

    it.each([
      {
        searchText: "CrystalMaiden",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "Antimage",
        expected: MockHeroes.AntiMage,
      },
      {
        searchText: "CentaurWarrunner",
        expected: MockHeroes.CentaurWarrunner,
      },
    ])(
      "should return name of the hero if name is written without spaces",
      ({ searchText, expected }) => {
        expect(heroService.getNameFor(searchText)).toEqual(expected);
      }
    );

    it.each([
      {
        searchText: "crystal-maiden",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "crystal_maiden",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "crystal%20maiden",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "cr=ystal/ma1iden",
        expected: MockHeroes.CrystalMaiden,
      },
    ])(
      "should return the name of the hero regardless of added symbols",
      ({ searchText, expected }) => {
        expect(heroService.getNameFor(searchText)).toEqual(expected);
      }
    );

    it.each([
      {
        searchText: "cm",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "CM",
        expected: MockHeroes.CrystalMaiden,
      },
      {
        searchText: "pudge",
        expected: MockHeroes.Pudge,
      },
      {
        searchText: "PUDGE",
        expected: MockHeroes.Pudge,
      },
    ])(
      "should be case insensitive for names and nicknames",
      ({ searchText, expected }) => {
        expect(heroService.getNameFor(searchText)).toEqual(expected);
      }
    );

    it("should return mirrored name if no matches are found", () => {
      expect(heroService.getNameFor("the_gambler")).toEqual({
        humanName: "the_gambler",
        technicalName: "the_gambler",
        nicknames: [],
      });
    });
  });
});
