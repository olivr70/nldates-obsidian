import * as chrono from "chrono-node";
import dayjs from "dayjs";
import { Component } from "chrono-node";

import { findMostLikelyADYear } from "../../calculation/years";
import { findPartialInDict } from "../../utils/months";
import { DateComponents } from "src/types";
import { dateToComponents, parseOrdinalNumberPattern, previousDay } from "../../calculation/utils";
import { matchAnyPattern, matchPartialPattern, matchPartialRegex } from "../../utils/regex";
import { getIntlMonthNames, getIntlWeekdayNames } from "../../utils/intl";
import { dictFromArrays } from "../../utils/tools";

export const VARIANTS_EN = ["GB", "US"];

export const LOCALES_EN = VARIANTS_EN.map((x) => `de-${x}`);


// constants from Chrono
// NOTE : these constants are not exported in the chrono.de


// Ordinals parsing
 
export const ORDINAL_BASE_DICTIONARY_EN: { [word: string]: number } = {
  "first": 1,
  "second": 2,
  "third": 3,
  "fourth": 4,
  "fifth": 5,
  "sixth": 6,
  "seventh": 7,
  "eighth": 8,
  "ninth": 9,
  "tenth": 10,
  "eleventh": 11,
  "twelfth": 12,
  "thirteenth": 13,
  "fourteenth": 14,
  "fifteenth": 15,
  "sixteenth": 16,
  "seventeenth": 17,
  "eighteenth": 18,
  "nineteenth": 19,
  "twentieth": 20,
  "twenty-first": 21,
  "twenty-second": 22,
  "twenty-third": 23,
  "twenty-fourth": 24,
  "twenty-fifth": 25,
  "twenty-sixth": 26,
  "twenty-seventh": 27,
  "twenty-eighth": 28,
  "twenty-ninth": 29,
  "thirtieth": 30,
  "thirty-first": 31,
};
  
  
  // combine ordinal roots and declinations : zweiten, zweitem,...
 export const ORDINAL_WORD_DICTIONARY_EN = ORDINAL_BASE_DICTIONARY_EN;
  
  
 export const ORDINAL_NUMBER_PATTERN_EN = `\\b(${matchAnyPattern(
    ORDINAL_WORD_DICTIONARY_EN, "\\b", "\\b"
  )}|(\\b[0-9]{1,2}\\b)[.]?)`;

  
function parseOrdinalNumberPatternDe(match: string): number {
  return parseOrdinalNumberPattern(ORDINAL_WORD_DICTIONARY_EN, match) 
        || parseInt(match.trim().replace(/[.]$/,""));
}

// Days parsing

export const DAY_NAMES_EN_INTL = getIntlWeekdayNames("en", "long");
export const DAY_NAMES_EN_DICT_INTL = dictFromArrays("de", DAY_NAMES_EN_INTL, getIntlWeekdayNames("de","short"))


export const DAY_NAMES_EN_PATTERN = matchPartialPattern(DAY_NAMES_EN_DICT_INTL,4);
export const DAY_NAMES_EN_REGEX = matchPartialRegex(DAY_NAMES_EN_DICT_INTL,4);

export const TIME_OF_DAYS_EN = [ "dawn", "morning", "midday", "afternoon", "evening", "night" ];
export const TIME_OF_DAYS_PATTERN = matchPartialPattern(TIME_OF_DAYS_EN, 2);

export const DAY_NAME_RELATIVES_DICT: {[key in string] : string } = {
  today : "today",
  yesterday : "yesterday",
  tomorrow:  "tomorrow",
  "the day before yesterday" : "the day before yesterday",
  "the day after tomorrow" : "the day after tomorrow",
}
export const DAY_NAMES_RELATIVE_EN_PATTERN = matchPartialPattern(DAY_NAME_RELATIVES_DICT,3,{allowAmbiguous:true});
export const DAY_NAMES_RELATIVE_EN_PARTIAL_REGEX = matchPartialRegex(DAY_NAME_RELATIVES_DICT,3, {word:true, followup:true, allowAmbiguous:true});


export function findDayFromStart(key:string):number {
  return DAY_NAMES_EN_INTL.findIndex((x) => x.toLowerCase().startsWith(key));
}

// Months parsing

// computed constants from Intl lib
// this does not include variants like 'jänner' or 'feber'
export const MONTH_NAMES_EN_INTL = getIntlMonthNames("en", "long");
export const MONTH_NAMES_EN_INTL_DICT = dictFromArrays("en", 
    MONTH_NAMES_EN_INTL, 
    getIntlMonthNames("en", "short"), 
    getIntlMonthNames("en", "narrow")
  );

export const MONTH_NAME_PATTERN_EN = `(${matchAnyPattern(MONTH_NAMES_EN_INTL_DICT)})`;
export const MONTH_NAMES_PARTIAL1_PATTERN_EN = matchPartialPattern(MONTH_NAMES_EN_INTL_DICT,1, {allowAmbiguous:true});
export const MONTH_NAMES_EN_PARTIAL1_REGEX = matchPartialRegex(MONTH_NAMES_EN_INTL_DICT,1, {allowAmbiguous:true});

export function parseMonthNameEn(name: string, def:number = NaN): number {
  return findPartialInDict("en", MONTH_NAMES_EN_INTL_DICT, name, def);
}


export const TIME_OF_DAY_PATTERN= `(${TIME_OF_DAYS_PATTERN})|(um\s*)?([0-1][0-9]|2[0-3]|[0-9])\b(:\d{1,2}|\s+uhr)`
export const TIME_OF_DAY_REGEX = new RegExp(TIME_OF_DAY_PATTERN, "i");
  
 
// year parsing
// pattern for a year, with 2 or 4 digits
  // copied from wanasit/chrono/src/locale/de/constants.ts

export const YEAR_PATTERN_EN = `(?:[0-9]{1,4})(\s+(?:BC|BCE|AD|CE))?`;
export function parseYear(match: string): number {
    if (/B/i.test(match)) {
        // before christ
        return -parseInt(match.replace(/[^0-9]+/gi, ""));
    }

    if (/AD/i.test(match) || /CE/i.test(match)) {
        // n.Chr.
        return parseInt(match.replace(/[^0-9]+/gi, ""));
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}




// dates with ordinal numbers

export const ORDINAL_DATE_EN = new RegExp(`${ORDINAL_NUMBER_PATTERN_EN}(?:\\s+(${MONTH_NAMES_PARTIAL1_PATTERN_EN}))?`, "i");

export function parseOrdinalDate(match:RegExpMatchArray):DateComponents {
  const dayInMonth = match[2] ? parseInt(match[2]): parseOrdinalNumberPatternDe(match[1])
  const month = match[3] ? parseMonthNameEn(match[3], dayjs().month()) : dayjs().month();
  const result:{[c in Component]?: number;} =  {
    day: dayInMonth,
    month: month + 1, // dayjs months are 0 based
    year: dayjs().year(),
  };
  console.log(result)
  return result;
}




