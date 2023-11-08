export const BASE_URL = `https://www.dota2.com/datafeed`;
export const PATCH_LIST_URL = `${BASE_URL}/patchnoteslist?language=english`;
export const HERO_LIST_URL = `${BASE_URL}/herolist?language=english`;
export const ITEM_LIST_URL = `${BASE_URL}/itemlist?language=english`;
export const ABILITY_LIST_URL = `${BASE_URL}/abilitylist?language=english`;
export const SPECIFIC_PATCH_URL = (version: string) =>
  `${BASE_URL}/patchnotes?version=${version}&language=english`;

export const UNKNOWN_TOKEN = 'unknown';

export const LAST_VERSION_PATCHED = `latestVersionParsed`;
