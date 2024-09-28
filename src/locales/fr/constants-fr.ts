import * as chrono from "chrono-node";
import dayjs from "dayjs";
import { Component } from "chrono-node";

import { DateComponents } from "../../types";
import { dateToComponents, parseOrdinalNumberPattern, previousDay } from "../../calculation/utils";
import { findMostLikelyADYear } from "../../calculation/years";
import { 
  matchAnyPattern, 
  matchPartialItemPattern, 
  matchPartialItemRegex, 
  matchPartialPattern, 
  matchPartialRegex, 
  regSrc

} from "../../utils/regex";
import { getIntlMonthNames, getIntlWeekdayNames } from "../../utils/intl";
import { findPartialInDict } from "../../utils/months";
import { toIsoWeekDay } from "../../utils/weeks";
import { dictFromArrays, stripDiacritics } from "../../utils";
import { computeDateFromWeek } from "../common/constants";

export const VARIANTS_FR = ["FR", "BE", "CH", "CA"];

export const LOCALES_FR = VARIANTS_FR.map((x) => `fr-${x}`);


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

export const NUMBER_PATTERN_FR = `(?<=\\W|^)(${matchAnyPattern(
  NUMBER_BASE_DICTIONARY_FR, 
)}|([0-9]{1,2}))(?=\\W)`;

/** parse a number from 1 to 31, in letter of digits */
export function parseNumberPatternFr(match: string): number {
  return parseOrdinalNumberPattern(NUMBER_BASE_DICTIONARY_FR, match) 
        || parseInt(match.trim().replace(/e$/,""));
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
  
  
  // accepts both 
 export const ORDINAL_WORD_DICTIONARY_FR = Object.fromEntries(
        Object.entries(ORDINAL_BASE_DICTIONARY_FR));
  
  
 export const ORDINAL_NUMBER_PATTERN_FR = `(?<=\\W|^)(${matchAnyPattern(
    ORDINAL_WORD_DICTIONARY_FR, 
  )}|(1(er|ère)|[0-9]{1,2})[e]?)(?=\\W)`;

  
function parseOrdinalNumberPatternFr(match: string): number {
  return parseOrdinalNumberPattern(ORDINAL_WORD_DICTIONARY_FR, match) 
        || parseInt(match.trim().replace(/[^0-9]+/g,""));
}

// Days parsing

export const DAY_NAMES_FR_INTL = getIntlWeekdayNames("fr", "long");
export const DAY_NAMES_FR_DICT_INTL = dictFromArrays("fr", DAY_NAMES_FR_INTL, getIntlWeekdayNames("fr","short"))


export const DAY_NAMES_FR_PATTERN = matchPartialPattern(DAY_NAMES_FR_DICT_INTL,2,true);
/** A day name in french */
export const DAY_NAMES_FR_REGEX = matchPartialRegex(DAY_NAMES_FR_DICT_INTL,2);

export const TIME_OF_DAYS_FR = [ "petit matin", "matin", "midi", "après-midi", "soirée", "nuit" ];
export const TIME_OF_DAYS_PATTERN = matchPartialPattern(TIME_OF_DAYS_FR, 1);

export const DAY_NAME_RELATIVES_DICT: {[key in string] : string } = {
  "aujourd'hui" : "aujourd'hui",
  hier : "hier",
  demain:  "demain",
  "avant-hier" : "avant-hier",
  "avant hier" : "avant-hier",
  "après-demain" : "après-demain",
  "après demain" : "après-demain",
  "apres-demain" : "après-demain",
  "apres demain" : "après-demain",
}
export const DAY_NAMES_RELATIVE_DE_PATTERN = matchPartialPattern(DAY_NAME_RELATIVES_DICT,3);
export const DAY_NAMES_RELATIVE_DE_PARTIAL_REGEX = matchPartialRegex(DAY_NAME_RELATIVES_DICT,3, true, true);

/**  finds a day number (0-based) from it start, returns -1 if no match */
export function findDayFromStartFr(key:string):number {
  const lowerKey = key.toLowerCase()
  return DAY_NAMES_FR_INTL.findIndex((x) => x.startsWith(lowerKey));
}

// Months parsing

// computed constants from Intl lib
// this does not include variants like 'jänner' or 'feber'
export const MONTH_NAMES_FR_INTL = getIntlMonthNames("fr", "long");
export const MONTH_NAMES_LONG_FR_INTL_DICT = dictFromArrays("fr", 
    MONTH_NAMES_FR_INTL, 
    MONTH_NAMES_FR_INTL.map(stripDiacritics).map(x => MONTH_NAMES_FR_INTL.includes(x) ? null : x)
  );
export const MONTH_NAMES_MIX_FR_INTL_DICT = dictFromArrays("fr", 
    MONTH_NAMES_FR_INTL, 
    MONTH_NAMES_FR_INTL.map(stripDiacritics).map(x => MONTH_NAMES_FR_INTL.includes(x) ? null : x),
    getIntlMonthNames("fr", "short"), 
    getIntlMonthNames("fr", "narrow"),
  );

export const MONTH_NAME_PATTERN_FR = `(${matchAnyPattern(MONTH_NAMES_MIX_FR_INTL_DICT)})`;
export const MONTH_NAMES_PARTIAL3_PATTERN_FR = matchPartialPattern(MONTH_NAMES_MIX_FR_INTL_DICT,3);
export const MONTH_NAMES_FR_PARTIAL3_REGEX = matchPartialRegex(MONTH_NAMES_MIX_FR_INTL_DICT,3);

// return -1 if no result
export function parseMonthNameFr(name: string, def:number = -1): number {
  return findPartialInDict("fr", MONTH_NAMES_MIX_FR_INTL_DICT, name, def);
}


export const TIME_OF_DAY_PATTERN= `(${TIME_OF_DAYS_PATTERN})|(à\s*)?([0-1][0-9]|2[0-3]|[0-9])\b(:\d{1,2}|\s+heures)?`
export const TIME_OF_DAY_REGEX = new RegExp(TIME_OF_DAY_PATTERN, "i");
  
 
// year parsing
// pattern for a year, with 2 or 4 digits
  // copied from wanasit/chrono/src/locale/de/constants.ts

export const ERA_PATTERN = `(BC|AC|AEC|EC|a(v|pr?)\\.? J\\.?-?C\\.?)?`
export function parseEraFr(match:string):number {
  switch (match.toLocaleLowerCase("fr")) {
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
export const YEAR_PATTERN_FR = `(?:-?[0-9]{1,4})`;
export const YEAR_REGEX_FR = new RegExp(YEAR_PATTERN_FR, "i")
export const YEAR_ERA_PATTERN_FR = `${YEAR_PATTERN_FR}(?:\\s*${ERA_PATTERN}`;
export function parseYear(match: string | RegExpExecArray): number {
    const parts = typeof match == "string" ? YEAR_REGEX_FR.exec(match) : match;
    if (!parts) return NaN;
    let rawYearNumber = parseInt(match[1]);
    if (match[2]) {
      if (rawYearNumber > 0) {
        rawYearNumber = parseEraFr(match[2]) * rawYearNumber;
      }
    }
    return findMostLikelyADYear(rawYearNumber);
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
  const key = Object.keys(UNITS_DICTIONARY_FR).find((x) => x.startsWith(search.toLocaleLowerCase("fr")));
  return key && UNITS_DICTIONARY_FR[key];
}

export const RELATIVE_FR = ["précédente","suivante","prochaine"]
export const RELATIVE_PARTIAL_FR_PATTERN = matchPartialPattern(RELATIVE_FR, 2, true)

export const REG_RELATiVE_PERIOD = `${SUCCESIVE_UNIT_FR}`

export const REG_FOLLOWING_DAY_FR = new RegExp(`${DAY_NAMES_FR_PATTERN}\\s+prochain`)
export function parsePreviousDayFr(match:RegExpMatchArray) {
    return dateToComponents(previousDay(findDayFromStartFr(match[1])))
}

// dates with ordinal numbers

export const ORDINAL_DATE_FR = new RegExp(`${ORDINAL_NUMBER_PATTERN_FR}(?:\\s+(${MONTH_NAMES_PARTIAL3_PATTERN_FR}))?`, "i");

export function parseOrdinalDate(match:RegExpMatchArray):DateComponents {
  const dayInMonth = match[2] ? parseInt(match[2]): parseOrdinalNumberPatternFr(match[1])
  const month = match[3] ? parseMonthNameFr(match[3], dayjs().month()) : dayjs().month();
  const result:{[c in Component]?: number;} =  {
    day: dayInMonth,
    month: month + 1, // dayjs months are 0 based
    year: dayjs().year(),
  };
  console.log(result)
  return result;
}

export const REG_JOUR_SEMAINE_X = new RegExp(`(${regSrc(DAY_NAMES_FR_REGEX)}(?:\\s+de\\s+la)?\\s+sem(?:aine)?` +
  `\\s+(\\d\\d?|${matchPartialItemPattern('prochaine',3)}|${matchPartialItemPattern('précédente',3)})`+
  `(\\s+(?:en\\s+|de\\s+(?:l'année\\s+)?)?(\\d{4}))?)`, "i")
export function extractJourSemaineX(match:RegExpMatchArray, refDate:Date, groupOffset = 0):DateComponents {
  const dbg = REG_JOUR_SEMAINE_X
  console.log("extractJourSemaineX(",match[0],",",refDate,")")
  if (match && match[groupOffset]) {
    const day = findDayFromStartFr(match[groupOffset + 2])
    const weekRef = match[groupOffset + 4].toLowerCase()
    const yearGroup = match[groupOffset + 6]
    const year = yearGroup ? parseInt(yearGroup) : new Date().getFullYear()
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



