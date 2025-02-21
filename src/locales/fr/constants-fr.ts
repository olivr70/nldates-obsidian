import * as chrono from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import { Component } from "chrono-node";

import { DateComponents, RELATIVE_DAY } from "../../types";
import { dateToComponents, followingDay, previousDay } from "../../calculation/utils";
import { findMostLikelyADYear } from "../../calculation/years";
import { 
  alt,
  lookBehind,
  matchAnyItem,
  matchAnyPattern, 
  matchPartialItem, 
  matchPartialItemPattern, 
  matchPartialItemRegex, 
  matchPartialPattern, 
  matchPartialRegex, 
  named, 
  negativeLookBehind, 
  oneOrMore, 
  opt, 
  regSrc,
  seq

} from "../../utils/regex";
import { dictFromArrays, stripDiacritics } from "../../utils/tools";
import { getIntlMonthNames, getIntlWeekdayNames } from "../../utils/intl";
import { toIsoWeekDay } from "../../utils/days";
import { computeRelativeDay } from "../../utils/weeks";
import { findPartialInDict } from "../../utils/months";
import { computeDateFromWeek, parseOrdinalNumberPattern, YEAR_VALUE_REG } from "../common/constants";

export const VARIANTS_FR = ["FR", "BE", "CH", "CA"];

export const LOCALES_FR = VARIANTS_FR.map((x) => `fr-${x}`);

/** fr */
const LOC = "fr"
/** LENIENT COLLATOR for French */
const COLLATOR_LENIENT = new Intl.Collator(LOC, { sensitivity:"base"})

// constants from Chrono
// NOTE : these constants are not exported in the chrono.de


const NUMBER_BASE_DICTIONARY_FR: { [word: string]: number } = {
  "un": 1,
  "deux": 2,
  "trois": 3,
  "quatre": 4,
  "cinq": 5,
  "six": 6,
  "sept": 7,
  "huit": 8,
  "neuf": 9,
  "dix": 10,
  "onze": 11,
  "douze": 12,
  "treize": 13,
  "quatorze": 14,
  "quinze": 15,
  "seize": 16,
  "dix-sept": 17,
  "dix-huit": 18,
  "dix-neuf": 19,
  "vingt": 20,
  "vingt-et-un": 21,
  "vingt-deux": 22,
  "vingt-trois": 23,
  "vingt-quatre": 24,
  "vingt-cinq": 25,
  "vingt-six": 26,
  "vingt-sept": 27,
  "vingt-huit": 28,
  "vingt-neuf": 29,
  "trente": 30,
  "trente-et-un": 31,
};

export const NUMBER_REG_FR_OLD = `(?<=\\W|^)(${matchAnyPattern(
  NUMBER_BASE_DICTIONARY_FR, 
)}|([0-9]{1,2}))(?=\\W)`;

/** un nombre en lettre entre 1 (un) et 31 (trente-et-un) */
export const NUMBER_IN_WORDS_REG_FR = alt({word:true}, 
    matchAnyItem(LOC, NUMBER_BASE_DICTIONARY_FR, {flags:"i"}),
    /([0-9]{1,2})/)

/** parse a number from 1 to 31, in letter of digits */
export function parseNumberInWordsRegFr(text: string): number {
  return parseOrdinalNumberPattern(NUMBER_BASE_DICTIONARY_FR, text, COLLATOR_LENIENT) 
      || parseInt(text?.trim());
}

// Ordinals parsing
 
export const ORDINAL_BASE_DICTIONARY_FR: { [word: string]: number } = {
  "premier": 1,
  "première": 1,
  "deuxième": 2,
  "second": 2,
  "seconde": 2,
  "trois": 3,
  "troisième": 3,
  "quatrième": 4,
  "cinquième": 5,
  "sixième": 6,
  "septième": 7,
  "huitième": 8,
  "neufième": 9,
  "dixième": 10,
  "onzième": 11,
  "douzième": 12,
  "treizième": 13,
  "quatorzième": 14,
  "quinzième": 15,
  "seizième": 16,
  "dix-septième": 17,
  "dix-huitième": 18,
  "dix-neufième": 19,
  "vingtième": 20,
  "vingt-et-unième": 21,
  "vingt-deuxième": 22,
  "vingt-troisième": 23,
  "vingt-quatrième": 24,
  "vingt-cinquième": 25,
  "vingt-sixième": 26,
  "vingt-septième": 27,
  "vingt-huitième": 28,
  "vingt-neufième": 29,
  "trentième": 30,
  "trente-et-unième": 31,
};
  
  
/** a french ordinal adjective word */
 export const ORDINAL_WORD_DICTIONARY_FR = Object.fromEntries(
        Object.entries(ORDINAL_BASE_DICTIONARY_FR));

    
/** in french, ordinals can be indicated as a number, followed by a superscript suffix
 - '1er' ot '1ere'
 - any umber, with 'e' (official) of "eme' (commonly found)"
 */
const MODIFIER_LETTER_SMALL_D = "\u1D48"  // ᵈ
const MODIFIER_LETTER_SMALL_E = "\u1D49"  // ᵉ
const MODIFIER_LETTER_SMALL_M = "\u1D50"  // ᵐ
const MODIFIER_LETTER_SMALL_N = "\u207F"  // ⁿ
const MODIFIER_LETTER_SMALL_R = "\u02B3"  // ʳ

const SUPERSCRIPT_ER= seq({}, MODIFIER_LETTER_SMALL_E, MODIFIER_LETTER_SMALL_R, opt(MODIFIER_LETTER_SMALL_E))
const SUPERSCRIPT_EME= seq({}, MODIFIER_LETTER_SMALL_E, opt(MODIFIER_LETTER_SMALL_M, MODIFIER_LETTER_SMALL_E))
const SUPERSCRIPT_ND= seq({}, MODIFIER_LETTER_SMALL_N, MODIFIER_LETTER_SMALL_D, opt(MODIFIER_LETTER_SMALL_E))

/** a french ordinal adjective in any form : word or number
 * For words
 * - Accepts both feminine and masculine forme : premier/première
 * - accepts both *deuxième* and *second/e*
 * - also accepts numbers in words : un, quatre, trente, vingt-et-un...
 * Many suffixes are matched
 * - as lower letters : 1er, 2e, 2ème, 2nd, 2nde
 * - ase superscript letters : 1ᵉʳ, 2ᵉ, 2ᵉᵐᵉ, 2ⁿᵈ, 2ⁿᵈᵉ
 */
 export const ORDINAL_NUMBER_REG_FR =
  alt(
    {flags:"i", word:true},
    matchAnyItem(LOC, ORDINAL_WORD_DICTIONARY_FR),
    NUMBER_IN_WORDS_REG_FR,
    /1(ere?|ère)|2(nde?)|[0-9]{1,2}([èe](?:me)?)/,
    alt({}, seq({},/1/,SUPERSCRIPT_ER), seq({}, /2/, SUPERSCRIPT_ND), seq({}, /\d{1,2}/, SUPERSCRIPT_EME))
  )

  
function parseOrdinalNumberPatternFr(text: string): number {
  return parseOrdinalNumberPattern(ORDINAL_WORD_DICTIONARY_FR, text, COLLATOR_LENIENT) 
        || parseNumberInWordsRegFr(text)
        || parseInt(text?.trim().replace(/[^0-9]+/g,""));
}

// Days parsing

export const DAY_NAMES_FR_INTL = getIntlWeekdayNames(LOC, "long");

/** WARNING : do not insert "short" datnames in the dictionnary (form "ven."). 
 * It creates an ambiguity between "vendredi" and "ven.", which means that the resulting
 * Regexp does not match "v","ve","ven"
 */
export const DAY_NAMES_FR_DICT_INTL = dictFromArrays(LOC, DAY_NAMES_FR_INTL)
export function parseDayNameFr(partialText:string):number {
  return findPartialInDict(DAY_NAMES_FR_DICT_INTL, partialText, NaN, [ COLLATOR_LENIENT ]);
}

/** A day name in french, with partial recognigtion
 * Matches : lundi, Mard, mer, j, VEN
 */
export const DAY_NAMES_FR_REGEX = seq({}, 
  matchPartialItem(LOC, DAY_NAMES_FR_DICT_INTL, {flags:"i", word:true}),
  // match a PERIOD, only if 3 letters before (it an abbreviation mark)
  opt(lookBehind(/\p{L}{3}/u), /\./)
  );

export const TIME_OF_DAYS_FR = [ "petit matin", "matin", "midi", "après-midi", "soirée", "nuit" ];
export const TIME_OF_DAYS_PATTERN = matchPartialPattern(TIME_OF_DAYS_FR, 2);



export const RELATIVES_FOR_DAYS_DICTIONARY_FR: { [word: string]: RELATIVE_DAY } = {
  "dernier": RELATIVE_DAY.PREVIOUS_OCCURING,
  "d'avant": RELATIVE_DAY.PREVIOUS_OCCURING,
  "d avant": RELATIVE_DAY.PREVIOUS_OCCURING,
  "précédent": RELATIVE_DAY.PREVIOUS_OCCURING,
  "en huit": RELATIVE_DAY.OF_NEXT_WEEK,
  "d'après": RELATIVE_DAY.NEXT_OCCURING,
  "prochain": RELATIVE_DAY.NEXT_OCCURING,
  "suivant": RELATIVE_DAY.NEXT_OCCURING
}
export const RELATIVES_FOR_DAYS_REGEX = matchPartialItem(LOC, RELATIVES_FOR_DAYS_DICTIONARY_FR, { flags:"i"});
export function parseRelativeForDay(text:string) {
  const offset = findPartialInDict<RELATIVE_DAY>(RELATIVES_FOR_DAYS_DICTIONARY_FR, text, NaN, [COLLATOR_LENIENT]);
  return offset;
}

export const DAY_NAME_RELATIVES_DICT: {[key in string] : string } = {
  "aujourd'hui" : "aujourd'hui",
  hier : "hier",
  demain:  "demain",
  "avant-hier" : "avant-hier",
  "après-demain" : "après-demain",
}
export const DAY_NAMES_RELATIVE_FR_PATTERN = matchPartialPattern(DAY_NAME_RELATIVES_DICT,3);
export const DAY_NAMES_RELATIVE_FR_PARTIAL_REGEX = matchPartialRegex(DAY_NAME_RELATIVES_DICT,3, {word:true, followup:true});

/**  finds a day number (0-based) from it start, returns -1 if no match */
export function findDayFromStartFr(key:string):number {
  const otherWithFindInDict = findPartialInDict(DAY_NAMES_FR_DICT_INTL, key, NaN, [ COLLATOR_LENIENT])
  const lowerKey = key.toLowerCase()
  return DAY_NAMES_FR_INTL.findIndex((x) => x.startsWith(lowerKey));
}

// Months parsing

// computed constants from Intl lib
// this does not include variants like 'jänner' or 'feber'
export const MONTH_NAMES_FR_INTL = getIntlMonthNames(LOC, "long");
export const MONTH_NAMES_LONG_FR_INTL_DICT = dictFromArrays(LOC, 
    MONTH_NAMES_FR_INTL, 
    MONTH_NAMES_FR_INTL.map(stripDiacritics).map(x => MONTH_NAMES_FR_INTL.includes(x) ? null : x)
  );
export const MONTH_NAMES_MIX_FR_INTL_DICT = dictFromArrays(LOC, 
    MONTH_NAMES_FR_INTL, 
    MONTH_NAMES_FR_INTL.map(stripDiacritics).map(x => MONTH_NAMES_FR_INTL.includes(x) ? null : x),
    getIntlMonthNames(LOC, "short"), 
    getIntlMonthNames(LOC, "narrow"),
  );

/** match a french month name */
export const MONTH_NAMES_FR_REGEX = matchAnyItem(LOC, MONTH_NAMES_MIX_FR_INTL_DICT, { word:true, flags:"i"});

export const MONTH_NAMES_FR_PARTIAL_REGEX = matchPartialItem(LOC, MONTH_NAMES_MIX_FR_INTL_DICT, { word:true, flags:"i"});

// return -1 if no result
export function parseMonthNameFr(name: string, def:number = -1): number {
  return findPartialInDict(MONTH_NAMES_MIX_FR_INTL_DICT, name, def, [ COLLATOR_LENIENT ]);
}


export const TIME_OF_DAY_PATTERN= `(${TIME_OF_DAYS_PATTERN})|(à\s*)?([0-1][0-9]|2[0-3]|[0-9])\b(:\d{1,2}|\s+heures)?`
export const TIME_OF_DAY_REGEX = new RegExp(TIME_OF_DAY_PATTERN, "i");
  
 
// year parsing
// pattern for a year, with 2 or 4 digits
  // copied from wanasit/chrono/src/locale/de/constants.ts

export const ERA_REG = /(?:BC|AC|AEC|EC|a(v|pr?)\.? J\.?-?C\.?)/
export function parseEraFr(match:string):number {
  switch (match?.toLocaleLowerCase(LOC)) {
    case "bc" : return -1
    case "aec" : return -1
    case "ac" : return 1
    case "ac" : return 1
    default:
      if (/av/i.test(match)) {
        // av. J.-C av JC 
        return -1
      } else {
        return 1;
      }
  }
}

/** @borrows {@YEAR_VALUE_REG} */
export const YEAR_REGEX_FR = YEAR_VALUE_REG
/** year and era, in french
 * groups : year_yefr, era_yefr
 * 
 * @returns NaN if invalid year
 */
export const YEAR_ERA_REGEX_FR = seq({}, named("year_yefr",YEAR_VALUE_REG), seq({cardinality:"?"}, /\s*/, named("era_yefr",ERA_REG)));
export function extractYearAndEraFr(match: RegExpMatchArray, refDate?: Date): number {
    const parts = typeof match == "string" ? YEAR_ERA_REGEX_FR.exec(match) : match;
    if (!parts) return NaN;
    let rawYearNumber = parseInt(parts.groups["year_yefr"]);
    if (match[2]) {
      if (rawYearNumber > 0) {
        rawYearNumber = parseEraFr(parts.groups["era_yefr"]) * rawYearNumber;
      }
    }
    return findMostLikelyADYear(rawYearNumber);
}
export function parseYearAndEraFr(text: string): number {
  return extractYearAndEraFr(YEAR_ERA_REGEX_FR.exec(text))
}

type SupportedUnits = "d" | "w" | "mo" | "y"
export const UNITS_DICTIONARY_FR: { [word: string]: SupportedUnits } = {
  "jour": "d",
  "semaine": "w",
  "mois": "mo",
  "an": "y",
  "année": "y",
}

export const UNITS_REG_DICT_FR = new Map<RegExp, SupportedUnits>( [
  [ matchPartialItemRegex("semaine",3), "w"],
  [ new RegExp("(la\\s+)?" + matchPartialItemPattern("semaine",1)), "w"],
  [ matchPartialItemRegex("mois",3), "mo"],
  [ new RegExp("(le\\s+)?" + matchPartialItemPattern("mois",1)), "mo"],
  [ matchPartialItemRegex("année",3), "y"],
  [ new RegExp("(l')?" + matchPartialItemPattern("année",1)), "y"],
])

export const SUCCESIVE_UNIT_FR = /((?:la\s+)?semaine|(?:l')?an(?:nnée)?|(le\s+)?(?:jour|mois))/
export function parseUnitFr(match:string|RegExpExecArray): SupportedUnits | "" {
  const search:string = typeof(match)== "string" ? match : match[1]
  return findPartialInDict(UNITS_DICTIONARY_FR, search, undefined,[ COLLATOR_LENIENT ])
}

export const RELATIVE_FR = ["précédente","suivante","prochaine"]
export const RELATIVE_PARTIAL3_FR_PATTERN = matchPartialPattern(RELATIVE_FR, 3, {word:true})

export const REG_RELATiVE_PERIOD = `${SUCCESIVE_UNIT_FR}`

/** ex : mardi prochain 
 * @deprecated ne reconnait que prochain. Utiliser {@link REG_RELATIVE_DAY_FR}, plus général
*/
export const REG_FOLLOWING_DAY_FR = seq({}, named("day",DAY_NAMES_FR_REGEX), /\s+prochain/)

export function parseFollowingDayFr(match:RegExpMatchArray) {
  return dateToComponents(followingDay(findDayFromStartFr(match.groups["day"])))
}
export function parsePreviousDayFr(match:RegExpMatchArray) {
    return dateToComponents(previousDay(findDayFromStartFr(match.groups["day"])))
}

// dates with ordinal numbers

/** date with ordinal : 1er janvier, */
export const ORDINAL_DATE_FR = seq(
  named("ordinal",ORDINAL_NUMBER_REG_FR),
  /\s+/, 
  named("month", MONTH_NAMES_FR_PARTIAL_REGEX),
  opt(/\s+/, YEAR_ERA_REGEX_FR));

export function extractOrdinalDate(match:RegExpMatchArray, refDate?:Date):DateComponents {
  const dayInMonth = parseOrdinalNumberPatternFr(match?.groups["ordinal"])
  const month = parseMonthNameFr(match?.groups["month"]);
  const year = extractYearAndEraFr(match, refDate)
  const result:{[c in Component]?: number;} =  {
    day: dayInMonth,
    month: month + 1, // dayjs months are 1 based
    year: year || dayjs().year(),
  };
  return result;
}


/** ex : mardi de la semaine 2 de l'année 2024 */
  export const REG_JOUR_SEMAINE_X = seq({flags:"i"}, 
    named("dayname",DAY_NAMES_FR_REGEX), 
    opt(/(\s+de\s+la)?\s+sem(?:aine)?/),
    /\s+/,
    named("week", alt({}, /\d\d?/, matchPartialItem(LOC, ['prochaine','précédente']))),
    opt(
      /\s+/,
      alt({}, /en\s+/, /de(?:\s+l'an(n(ée?)?)?)?\s+/),
      named("year", YEAR_REGEX_FR)
    ))

export function extractJourSemaineX(match:RegExpMatchArray, refDate:Date, groupOffset = 0):DateComponents {
  const r = REG_JOUR_SEMAINE_X;
  if (match && match[groupOffset]) {
    const day = findDayFromStartFr(match.groups["dayname"])
    const weekRef = match.groups["week"].toLowerCase()
    const yearGroup = match.groups["year"]
    const year = yearGroup ? parseInt(yearGroup) : refDate.getFullYear()
    let weekNum = 1
    if (weekRef.startsWith("pro")) {
      const result = new Date(refDate.valueOf())
      result.setDate(result.getDate() + 7 + toIsoWeekDay(day) - toIsoWeekDay(result.getDay()))
      return {year:result.getFullYear(), month:result.getMonth()+1, day:result.getDate()};
    } else if (weekRef.startsWith("pré")) {
      const result = new Date(refDate.valueOf())
      result.setDate(result.getDate() + -7 + toIsoWeekDay(day) - toIsoWeekDay(result.getDay()))
      return {year:result.getFullYear(), month:result.getMonth()+1, day:result.getDate()};
    } else {
      weekNum = parseInt(weekRef);
    }

    return computeDateFromWeek(year, weekNum, day)
  }
}
export function parseJourSemaineX(text:string, refDate:Date = new Date()) {
  return extractJourSemaineX(REG_JOUR_SEMAINE_X.exec(text), refDate)
}

// ----------------------------------------------------------------
/** ex : mardi prochain, lundi d'avant, mercredi en huit... */
export const REG_RELATIVE_DAY_FR = seq({}, named("day", DAY_NAMES_FR_REGEX), /\s+/, named("rel",RELATIVES_FOR_DAYS_REGEX))
export function extractRegRelativeDayFr(match:RegExpMatchArray, refDate:Date) {
  if (match) {
    const dayNum = parseDayNameFr(match.groups["day"])
    const dayRel = parseRelativeForDay(match.groups["rel"])
    if (!isNaN(dayNum)) {
      return computeRelativeDay(dayNum, dayRel, dayjs(refDate))
    }
  }
}
export function parseRegRelativeDayFr(text:string, refDate:Date = new Date()) {
  return extractRegRelativeDayFr(REG_RELATIVE_DAY_FR.exec(text), refDate)
}



