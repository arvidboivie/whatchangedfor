import { parse, ParseResult } from "papaparse";
import { createReadStream } from "fs";
import { HeroName, isHeroName } from "../src/app/hero.interfaces";
import { writeFile } from "fs/promises";

const RESOURCE_PATH = `${__dirname}/../resources`;

export const getHeroNames = async (): Promise<void> => {
  const input = createReadStream(`${RESOURCE_PATH}/hero-data.csv`);

  const heroList: Promise<ParseResult<HeroName>> = new Promise((resolve) => {
    parse(input, {
      delimiter: ";",
      header: true,
      transform: (value: string, header: string) => {
        value = value.trim();
        switch (header) {
          case "nicknames":
            return value.length > 0
              ? value.split(",").map((n) => n.trim().toLowerCase())
              : [];
          default:
            return value;
        }
      },
      complete: (results: ParseResult<HeroName>) => resolve(results),
    });
  });

  const heroData = (await heroList).data;

  heroData.forEach((heroName) => {
    if (!isHeroName(heroName)) {
      throw Error(
        `Invalid hero name found when importing: ${JSON.stringify(heroName)}`,
        {}
      );
    }
  });

  await writeFile(`${RESOURCE_PATH}/hero-data.json`, JSON.stringify(heroData));
};

getHeroNames();
