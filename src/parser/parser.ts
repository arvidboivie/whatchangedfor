// import { HTMLElement, parse } from 'node-html-parser';
// import util from 'util';
// import * as puppeteer from 'puppeteer';
// import { DynamoClient } from '../dynamodb/dynamodb.client';
// import { AbilityChanges, ParsedChanges } from '../interfaces';
// const { getChrome } = require('../chrome-script');

// enum NoteType {
//   GENERAL,
//   ABILITY,
//   TALENT,
// }

// export const parseChanges = async (version: string) => {
//   const chrome = getChrome();

//   const browser = await puppeteer.connect({
//     browserWSEndpoint: chrome.endpoint,
//   });
//   const page = await browser.newPage();

//   await page.goto(`https://www.dota2.com/patches/${version}`);

//   await page.waitForNetworkIdle();

//   const notesText = await page.evaluate(() => {
//     return document.querySelector('[class^="patchnotespage_Body_11CXi"')
//       ?.outerHTML;
//   });

//   if (!notesText) {
//     throw Error('Unable to parse notes');
//   }

//   await browser.close();

//   const parsedPage = parse(notesText);

//   const heroNotes = await parsedPage.querySelectorAll(
//     '[class^="patchnotespage_PatchNoteHero"]'
//   );

//   const heroChanges: ParsedChanges[] = heroNotes.map((heroElement) => {
//     let name = heroElement.querySelector(`[class^="patchnotespage_HeroName"]`)
//       ?.text!;

//     let notes = heroElement.querySelectorAll(
//       `[class^="patchnotespage_NoteElement"]`
//     );

//     let generalChanges: string[] = [];
//     let abilityChanges: AbilityChanges = {};
//     let talentChanges: string[] = [];

//     notes.forEach((noteElement) => {
//       let noteType = findNoteType(noteElement);

//       switch (noteType) {
//         case NoteType.GENERAL:
//           generalChanges.push(noteElement.text);
//           break;
//         case NoteType.ABILITY:
//           let abilityName = findAbilityName(noteElement);

//           if (abilityChanges[abilityName]) {
//             abilityChanges[abilityName].push(noteElement.text);
//             break;
//           }

//           abilityChanges[abilityName] = [noteElement.text];
//           break;
//         case NoteType.TALENT:
//           talentChanges.push(noteElement.text);
//           break;
//       }
//     });

//     return {
//       name,
//       generalChanges,
//       abilityChanges,
//       talentChanges,
//     };
//   });

//   // console.log(util.inspect(heroChanges, false, null, true));

//   const dynamoClient = new DynamoClient();

//   let dynamoOperations = heroChanges.map((hero) => {
//     let { name, ...heroChanges } = hero;
//     return dynamoClient.put(toSnakeCase(name), version, heroChanges);
//   });

//   await Promise.all(dynamoOperations);
// };

// const version = process.argv[2]; // First user CLI argument comes at pos 2

// if (!version) {
//   throw Error(`You need to provide a version to run!`);
// }

// parseChanges(version);

// const toSnakeCase = (toSnake: string): string =>
//   toSnake.toLowerCase().replaceAll(` `, `_`);

// function findNoteType(element: HTMLElement): NoteType {
//   if (element.parentNode.classNames.match(`^patchnotespage_AbilityNote`)) {
//     return NoteType.ABILITY;
//   }

//   if (element.parentNode.classNames.match(`^patchnotespage_PatchNoteHero`)) {
//     return NoteType.GENERAL;
//   }

//   if (element.parentNode.classNames.match(`^patchnotespage_TalentNotes`)) {
//     return NoteType.TALENT;
//   }

//   return findNoteType(element.parentNode);
// }

// function findAbilityName(noteElement: HTMLElement): string {
//   let previousSibling = noteElement.previousElementSibling;

//   if (previousSibling.classNames.match(`^patchnotespage_AbilityName`)) {
//     return previousSibling.text;
//   }

//   return findAbilityName(previousSibling);
// }
