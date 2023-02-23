import { ParserDota2Datafeed } from "./parser.dota2-datafeed";
import fetch from "node-fetch";
import { PatchNotes, Reference } from "../../interfaces";
import { FetchService } from "../fetch.service";

describe("ParserDota2Datafeed", () => {
  let parser: ParserDota2Datafeed;
  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(async () => {
    parser = new ParserDota2Datafeed();
    mockedFetch.mockImplementation(((url: string) => {
      let fetchResponse: Reference;

      switch (url) {
        case "https://www.dota2.com/datafeed/itemlist?language=english":
          fetchResponse = {
            id: 1,
            name_english_loc: "Black King Bar",
          };
          break;
        case "https://www.dota2.com/datafeed/herolist?language=english":
          fetchResponse = {
            id: 1,
            name_english_loc: "Pudge",
          };
          break;
        case "https://www.dota2.com/datafeed/abilitylist?language=english":
          fetchResponse = {
            id: 1,
            name_english_loc: "Meat Hook",
          };
          break;
      }

      return Promise.resolve({
        json: Promise.resolve(() => fetchResponse),
      });
    }) as unknown as typeof fetch);

    await parser.setup();

    mockedFetch.mockImplementation(jest.fn());
  });

  afterEach(() => {
    mockedFetch.mockClear();
  });

  it("should call the correct url for each patch", () => {
    parser.parse("7.32");
    expect(mockedFetch).toHaveBeenCalledWith(
      "https://www.dota2.com/datafeed/patchnotes?version=7.32&language=english"
    );
  });

  it.each([
    {
      list: "items",
      url: "https://www.dota2.com/datafeed/itemlist?language=english",
    },
    {
      list: "heroes",
      url: "https://www.dota2.com/datafeed/herolist?language=english",
    },
    {
      list: "abilities",
      url: "https://www.dota2.com/datafeed/abilitylist?language=english",
    },
  ])("should fetch $list from datafeed", ({ url }) => {
    await parser.setup;
    expect(mockedFetch).toHaveBeenCalledWith(url);
  });

  it.each([
    {
      description: "no changes in patch",
      response: {} as unknown as PatchNotes,
      output: [],
    },
    {
      description: "only hero changes in patch",
      response: {
        heroes: {
          hero_id: 1,
          hero_notes: ["Updated hero ability"],
        },
      } as unknown as PatchNotes,
      output: [
        {
          unitName: "Pudge",
          changes: ["Updated hero ability"],
        },
      ],
    },
    {
      description: "only item changes in patch",
      response: {
        items: {
          ability_id: 1,
          ability_notes: ["Updated item cost"],
        },
      } as unknown as PatchNotes,
      output: [
        {
          unitName: "Black King Bar",
          changes: ["Updated item cost"],
        },
      ],
    },
    {
      description: "Both item and hero changes in patch",
      response: {
        heroes: {
          hero_id: 1,
          hero_notes: ["Updated hero ability"],
        },
        items: {
          ability_id: 1,
          ability_notes: ["Updated item cost"],
        },
      } as unknown as PatchNotes,
      output: [
        {
          unitName: "Black King Bar",
          changes: ["Updated item cost"],
        },
        {
          unitName: "Pudge",
          changes: ["Updated hero ability"],
        },
      ],
    },
  ])("should parse correctly: $description", ({ response, output }) => {
    mockedFetch.mockImplementation();

    expect(parser.parse("7.32")).toBe(output);
  });
});
