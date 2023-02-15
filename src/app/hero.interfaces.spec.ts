import { HeroName, isHeroName } from "./hero.interfaces";

describe("HeroName type guard", () => {
  describe("should accept", () => {
    it("should accept a HeroName with nicknames", () => {
      const heroName: HeroName = {
        humanName: "test",
        technicalName: "_test",
        nicknames: ["test"],
      };

      expect(isHeroName(heroName)).toBeTruthy();
    });

    it("should accept a HeroName with no nicknames", () => {
      const heroName: HeroName = {
        humanName: "test",
        technicalName: "_test",
        nicknames: [],
      };

      expect(isHeroName(heroName)).toBeTruthy();
    });
  });

  describe("should reject", () => {
    it("should reject empty object", () => {
      const heroName = {};

      expect(isHeroName(heroName)).toBeFalsy();
    });

    it("should reject missing keys", () => {
      const heroName = {
        humanName: "test",
      };

      expect(isHeroName(heroName)).toBeFalsy();
    });

    it("should reject wrong type of array", () => {
      const heroName = {
        humanName: "test",
        technicalName: "_test",
        nicknames: [1, 2],
      };

      expect(isHeroName(heroName)).toBeFalsy();
    });
  });
});
