import * as chrono from "chrono-node";
import dayjs from "dayjs";
import 'dayjs/locale/de';
import { Component } from "chrono-node";

import { findMostLikelyADYear } from "../../calculation/years";
import { findPartialInDict } from "../../utils/months";
import { DateComponents } from "src/types";
import { dateToComponents, previousDay } from "../../calculation/utils";
import { matchAnyPattern, matchPartialPattern, matchPartialItem, regSrc, seq, matchAnyItem, named, opt, alt } from "../../utils/regex";
import { getIntlMonthNames, getIntlWeekdayNames } from "../../utils/intl";
import { dictFromArrays } from "../../utils/tools";
import { DAY_IN_MONTH_REG, extractSignedYear, parseOrdinalNumberPattern, SIGNED_YEAR_REG } from "../common/constants";

dayjs.locale("de")

/** GERMAN */
const LOC = "de"
/** Collator for GERMAN, sensible only to "base" */
const COLLATOR_LENIENT = new Intl.Collator(LOC, { sensitivity:"base"})

export const VARIANTS_DE = ["DE","AT","CH","LU","LI","BE"];

export const LOCALES_DE = VARIANTS_DE.map((x) => `${LOC}-${x}`);


// constants from Chrono
// NOTE : these constants are not exported in the chrono.de


// Ordinals parsing
 
export const ORDINAL_BASE_DICTIONARY_DE: { [word: string]: number } = {
  "erst": 1,
  "zweit": 2,
  "dritt": 3,
  "viert": 4,
  "fünft": 5,
  "sechst": 6,
  "siebent": 7,
  "siebt": 7,
  "acht": 8,
  "neunt": 9,
  "zehnt": 10,
  "eflt": 11,
  "zwölft": 12,
  "dreizehnt": 13,
  "vierzehnt": 14,
  "fünfzehnt": 15,
  "sechzehnt": 16,
  "siebzehnt": 17,
  "achtzehnt": 18,
  "neunzehnt": 19,
  "zwanzigst": 20,
  "einundzwanzigst": 21,
  "zweiundzwanzigst": 22,
  "dreiundzwanzigst": 23,
  "vierundzwanzigst": 24,
  "fünfundzwanzigst": 25,
  "sechsundzwanzigst": 26,
  "siebenundzwanzigst": 27,
  "achtundzwanzigst": 28,
  "neunundzwanzigst": 29,
  "dreißigst": 30,
  "dreissigst": 30,
  "einunddreißigst": 31,
  "einunddreissigst": 31,
};
  
  export const ORDINAL_DECLINATIONS = ["e","em","en","er","es"];
  
  // combine ordinal roots and declinations : zweiten, zweitem,...
 export const ORDINAL_WORD_DICTIONARY_DE = Object.fromEntries(
        Object.entries(ORDINAL_BASE_DICTIONARY_DE).reduce((r:[string,number][], [k,v]) => {
      ORDINAL_DECLINATIONS.forEach((x) => {
        r.push([k+x,v]);
      })
      return r;
    }, [] ));
  
  
 export const ORDINAL_NUMBER_REG_DE = new RegExp(`\\b(${matchAnyPattern(
    ORDINAL_WORD_DICTIONARY_DE, "\\b", "\\b"
  )}|(\\b[0-9]{1,2}\\b)[.]?)`);

  
function parseOrdinalNumberPatternDe(match: string): number {
  return parseOrdinalNumberPattern(ORDINAL_WORD_DICTIONARY_DE, match, COLLATOR_LENIENT) 
        || parseInt(match.trim().replace(/[.]$/,""));
}

// Days parsing

export const DAY_NAMES_DE_INTL = getIntlWeekdayNames(LOC, "long");
export const DAY_NAMES_DE_DICT_INTL = dictFromArrays(LOC, DAY_NAMES_DE_INTL)


export const DAY_NAMES_DE_REGEX = matchPartialItem(LOC, DAY_NAMES_DE_DICT_INTL, {word:true});


export const DAY_NAME_RELATIVES_DICT: {[key in string] : string } = {
  heute : "heute",
  gestern : "gestern",
  morgen:  "morgen",
  vorgestern : "vorgestern",
  "übermorgen" : "übermorgen",
  uebermorgen : "übermorgen"
}
export const DAY_NAMES_RELATIVE_DE_PARTIAL_REGEX = matchPartialItem(LOC, DAY_NAME_RELATIVES_DICT, {word:true, followup:true});


export function findDayFromStart(key:string):number {
  return findPartialInDict(DAY_NAMES_DE_DICT_INTL, key, NaN, [COLLATOR_LENIENT])
  return DAY_NAMES_DE_INTL.findIndex((x) => x.toLowerCase().startsWith(key.toLocaleLowerCase(LOC)));
}

// Months parsing

// computed constants from Intl lib
// this does not include variants like 'jänner' or 'feber'
export const MONTH_NAMES_DE_INTL = getIntlMonthNames("de", "long");
export const MONTH_NAMES_DE_INTL_DICT = dictFromArrays("de", 
    MONTH_NAMES_DE_INTL, 
    getIntlMonthNames(LOC, "short"), 
    getIntlMonthNames(LOC, "narrow"),
   [ "jänner", "feber"], // austrian month names
   ["jän", "feb"] // austrian short month names
  );
  MONTH_NAMES_DE_INTL_DICT["mrz"] = 3;

export const MONTH_NAMES_DE_REG = matchAnyItem(LOC, MONTH_NAMES_DE_INTL_DICT)
export const MONTH_NAMES_DE_PARTIAL_REG = matchPartialItem(LOC, MONTH_NAMES_DE_INTL_DICT);

export function parseMonthNameDe(name: string, def:number = NaN): number {
  return findPartialInDict(MONTH_NAMES_DE_INTL_DICT, name, def, [COLLATOR_LENIENT]);
}


  
 
// year parsing
// pattern for a year, with 2 or 4 digits
  // copied from wanasit/chrono/src/locale/de/constants.ts

/** matches : 
- v.Chr (vor Chistus), 
- n.Chr (nach Christus),
490 V. ZTR. and 1870 N. ZTR., meaning VOR ZEITRECHNUNG and NACH ZEITRECHNUNG (before and after "time computation").

Read more: http://www.time.com/time/magazine/article/0,9171,759195,00.html#ixzz0tuxv1DMy
- u.Z. stands for “unserer Zeitrechnung” (of our time)
- v.Z. stands for “vor unserer Zeitrechnung, (before our era)
- v.ZTR. stands for VOR ZEITRECHNUNG, (before "time computation")
- n.ZTR. stands for NACH ZEITRECHNUNG, (after "time computation")
- udgZ” stands for “unserer derzeitigen Zeitrechnung,” (of our current era)
- v. u. d. g. Z. ( “vor unserer derzeitigen Zeitrechnung.”) (before our current era)
- d.g.Z.” stands for “der gegenwärtigen Zeitrechnung,” (of the present era)
- v. d. g. Z. (“vor der gegenwärtigen Zeitrechnung”) (before the present era)
*/

export const NCHR_ZTR_REG = /[vn]\.?\s*(?:C(?:hr?)?\.?|(?:Z(?:tr?)?\.?))/i  // https://regex101.com/r/wDTbG4/1
export const VUDGZ_REG = /(?:v\.?\s*)?u\.?(?:\s*d\.?)?(?:\s*g\.?)?\s*z\.?/i

/** @deprecated */
export const ERA_REG_DE_OLD = new RegExp(`(?:${regSrc(NCHR_ZTR_REG)}|${regSrc(VUDGZ_REG)})`, "i")
export const ERA_REG_DE = alt({flags:"i"}, NCHR_ZTR_REG, VUDGZ_REG)

export function parseEraDe(match: string): "BCE" | "CE" | undefined {
  if (/\bv/i.test(match)) {
      // v.Chr. of vztr of v.u. d. g. z.
      return "BCE";
  }

  if (/^[nu]/i.test(match)) {
      // n.Chr. / u.d.z. / 
      return "CE"
  }
  return undefined;
}

// year parsing

/** reference to a year, including era (same as FULL_YEAR_REG_DE) */
export function FULL_YEAR_DE(idx:string) {
  seq(seq({name:`year_${idx}`}, SIGNED_YEAR_REG), seq({cardinality:"?"},/\s+/, seq({name:`era_${idx}`}, ERA_REG_DE)))
}
export function extractFullYearDe(match: RegExpExecArray, idx:string): number {
  let yearValue = parseInt(match.groups[`year_${idx}`])
  const suffixEra = parseEraDe(match.groups[`era_${idx}`])
  const result = suffixEra == "BCE" && yearValue > 0 ? -yearValue : yearValue; 
  return findMostLikelyADYear(result);
}

/** reference to a year, including era */
export const FULL_YEAR_REG_DE_OLD = new RegExp(`${regSrc(SIGNED_YEAR_REG)}(?:\\s+(${regSrc(ERA_REG_DE)}))?`,"i");
export const FULL_YEAR_REG_DE = seq(named("year_fy",SIGNED_YEAR_REG), opt(/\s+/, named("era_fy",ERA_REG_DE)))
              // group 1 : optional sign (for BCE et CE)
              // group 2 : year number
              // group 3 : era string
/** extract year and era, if match of {@link FULL_YEAR_REG_DE}  
 *  if year is signed (- or +), era is ignored
 *  if no sign, use era in suffix
*/
export function extractYearDe(match: RegExpExecArray, offset = 0): number {

  const [yearSign, yearValue] = extractSignedYear(match.groups["year_fy"])
    const signEra = (yearSign == "-" ? "BCE" : (yearSign == "+" ? "CE" : undefined))
    const suffixEra = parseEraDe(match.groups["era_fy"])
    const era = signEra || suffixEra || "CE"
    const result = era == "BCE" ? -Math.abs(yearValue) : Math.abs(yearValue); 
    return findMostLikelyADYear(result);
}
export function parseYearDe(text: string) {
  return extractYearDe(FULL_YEAR_REG_DE.exec(text))
}



export const REG_VERGANGENE_TAG = /(verg(?:a(?:n(?:g(?:e(?:ne?)?)?)?)?)?)\b\s*(.*)/i

export function parseVergangene(match:RegExpMatchArray) {
    return dateToComponents(previousDay(findDayFromStart(match[2])))
}

// German long date, like December 10, 2024
export const LONG_DATE_DE = seq({}
  , seq({name:"month"},MONTH_NAMES_DE_PARTIAL_REG)
  , seq({cardinality:"?"}, 
      /\s+/, 
      seq({name: "dayNum"}, DAY_IN_MONTH_REG), 
      seq({cardinality:"?"}, /\s+/, seq({name:"year"}, FULL_YEAR_REG_DE))))
export function extractLongDateDe(match:RegExpMatchArray) {
  if (match) {
    const day = parseInt(match.groups["dayNum"])
    const year = parseInt(match.groups["year"]) || new Date().getFullYear()
    const month = match.groups["month"] ? parseMonthNameDe(match.groups["month"], dayjs().month()) : dayjs().month();
    const result:{[c in Component]?: number;} =  {
      day,
      month: month + 1, // dayjs months are 0 based
      year,
    };
    return result;
  }
}
export function parseLongDateDe(text:string) {
  return extractLongDateDe(LONG_DATE_DE.exec(text))
}

// dates with ordinal numbers

export const ORDINAL_DATE_DE = new RegExp(`${regSrc(ORDINAL_NUMBER_REG_DE)}(?:\\s+(${regSrc(MONTH_NAMES_DE_PARTIAL_REG)}))?`, "i");

export function extractOrdinalDate(match:RegExpMatchArray, offset = 0):DateComponents {
  const dayInMonth = match[2+offset] ? parseInt(match[2+offset]): parseOrdinalNumberPatternDe(match[1+offset])
  const month = match[3+offset] ? parseMonthNameDe(match[3+offset], dayjs().month()) : dayjs().month();
  const result:{[c in Component]?: number;} =  {
    day: dayInMonth,
    month: month + 1, // dayjs months are 0 based
    year: new Date().getFullYear(),
  };
  console.log(result)
  return result;
}

// maches : um 12, um 12 Uhr, um 12:45, 09:45, 
export const TIME_OF_DAY_VAL_REG = /(?:um\s*)?([0-1][0-9]|2[0-3]|[0-9])\b(?::([0-5][0-9]?|[6-9])|\s+uhr)?/
export function extractTimeOfDayVal(match:RegExpMatchArray, offset = 0):DateComponents {
  const result = { hour : parseInt(match[1 + offset]) }
  const minute = parseInt(match[2 + offset])
  return isNaN(minute) ? result : { minute, ...result }
}

// Source : https://www.germanveryeasy.com/date
export const PARTS_OF_DAY_NAMES_DE_DICT = {
  "jetzt" : -1,
  "morgen" : 6,
  "vormittag" : 10,
  "mittag" : 12,
  "nachmittag" : 14,
  "abend" : 16,
  "nacht" : 18
}

export const POD_NAME_DE_PATTERN = `(${matchAnyPattern(PARTS_OF_DAY_NAMES_DE_DICT)})`;
export const POD_NAME_OR_VAL_DE_PATTERN= `(${POD_NAME_DE_PATTERN})|`
export const POD_DE_REGEX = new RegExp(POD_NAME_OR_VAL_DE_PATTERN, "i");

export const POD_PARTIAL5_REGEX = matchPartialItem(LOC, PARTS_OF_DAY_NAMES_DE_DICT);

export function parsePartOfDayDe(match:string):DateComponents {
  const hour = findPartialInDict(PARTS_OF_DAY_NAMES_DE_DICT, match, NaN );
  return hour > 0 ? { hour } : { hour: dayjs().hour(), minute : dayjs().minute()}
}



