import * as chrono from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Component } from "chrono-node";

import { DateComponents, RELATIVE_DAY, RELATIVE_REL } from "../../types";
import { findMostLikelyADYear } from "../../calculation/years";
import { 
  alt,
  matchAnyItem,
  matchPartialItem,
  named, 
  opt, 
  seq

} from "../../utils/regex";
import { dictFromArrays } from "../../utils/tools";
import { getIntlMonthNames, getIntlWeekdayNames } from "../../utils/intl";
import { computeRelativeDay } from "../../utils/weeks";
import { findPartialInDict } from "../../utils/months";
import { computeDateFromWeek, DAY_IN_MONTH_REG, parseOrdinalNumberPattern, WEEK_NUMBER_REG, YEAR_VALUE_4_REG } from "../common/constants";

dayjs.extend(isoWeek)

const LOC = "pt"
/** a Portuguese collator using "Base" sensitivity */
const COLLATOR_LENIENT = new Intl.Collator(LOC, { sensitivity:"base"})

export const VARIANTS_PT = ["PL", "AF", "AO", "BR", "GO", "GW", "MO", "MZ","PT","ST","TL"];

export const LOCALES_PT = VARIANTS_PT.map((x) => `${LOC}-${x}`);


// constants from Chrono
// NOTE : these constants are not exported in the chrono.de

//#region Numbers

/** dictionnary of numbers as words, from 1 to 31 */
const NUMBER_BASE_PT_DICT: { [word: string]: number } = {
    "um": 1,
    "dois": 2,
    "três": 3,
    "quatro": 4,
    "cinco": 5,
    "seis": 6,
    "sete": 7,
    "oito": 8,
    "nove": 9,
    "dez": 10,
    "onze": 11,
    "doze": 12,
    "treze": 13,
    "catorze": 14,
    "quinze": 15,
    "dezesseis": 16,
    "dezessete": 17,
    "dezoito": 18,
    "dezenove": 19,
    "vinte": 20,
    "vinte e um": 21,
    "vinte e dois": 22,
    "vinte e três": 23,
    "vinte e quatro": 24,
    "vinte e cinco": 25,
    "vinte e seis": 26,
    "vinte e sete": 27,
    "vinte e oito": 28,
    "vinte e nove": 29,
    "trinta": 30,
    "trinta e um": 31
};


export const NUMBER_PT_REGEX = alt({flags:"i", word:true},
    matchAnyItem(LOC, NUMBER_BASE_PT_DICT),
    DAY_IN_MONTH_REG );

/** parse a number from 1 to 31, in letter of digits */
export function parseNumberPatternPt(match: string): number {
  return parseOrdinalNumberPattern(NUMBER_BASE_PT_DICT, match, COLLATOR_LENIENT) 
        || parseInt(match.trim());
}

//#region Ordinals parsing
 
/** portuguese masculine ordinal numbers */
export const MASC_ORDINAL_BASE_PT_DICT: { [word: string]: number } = {
    "primeiro": 1,
    "segundo": 2,
    "terceiro": 3,
    "quarto": 4,
    "quinto": 5,
    "sexto": 6,
    "sétimo": 7,
    "oitavo": 8,
    "nono": 9,
    "décimo": 10,
    "décimo primeiro": 11,
    "décimo segundo": 12,
    "décimo terceiro": 13,
    "décimo quarto": 14,
    "décimo quinto": 15,
    "décimo sexto": 16,
    "décimo sétimo": 17,
    "décimo oitavo": 18,
    "décimo nono": 19,
    "vigésimo": 20,
    "vigésimo primeiro": 21,
    "vigésimo segundo": 22,
    "vigésimo terceiro": 23,
    "vigésimo quarto": 24,
    "vigésimo quinto": 25,
    "vigésimo sexto": 26,
    "vigésimo sétimo": 27,
    "vigésimo oitavo": 28,
    "vigésimo nono": 29,
    "trigésimo": 30,
    "trigésimo primeiro":  31
};
  
/** portuguese feminined ordinal numbers */
const FEM_ORDINAL_WORD_PT_DICT 
  = Object.entries(MASC_ORDINAL_BASE_PT_DICT).map(x => [x[0].replace(/o\b/g, "a"), x[1]])
  
/** a portuguese ordinal adjective word */
 export const ORDINAL_WORD_PT_DICT = Object.fromEntries(
        [...Object.entries(MASC_ORDINAL_BASE_PT_DICT), 
        ...FEM_ORDINAL_WORD_PT_DICT]);
  
  
/** a portuguese ordinal adjective : word (masculine of feminine) or number */
 export const ORDINAL_NUMBER_PT_REGEX = alt({word:true}, 
      matchAnyItem(LOC, ORDINAL_WORD_PT_DICT, {flags:"i" }), 
      /(?:[1-9][0-9]?|0[1-9])[ºª°]/
    )

  
function parseOrdinalNumberPatternPt(match: string): number {
  return parseOrdinalNumberPattern(ORDINAL_WORD_PT_DICT, match, COLLATOR_LENIENT) 
        || parseInt(match.trim().replace(/[^0-9]+/g,""));
}
//#endregion

//#region Days parsing

export const DAY_NAMES_INTL_PT = getIntlWeekdayNames(LOC, "long");
export const DAY_NAMES_INTL_PT_DICT = dictFromArrays(LOC, DAY_NAMES_INTL_PT, getIntlWeekdayNames(LOC,"short"))
export function parseDayNamePt(partialText:string):number {
  return findPartialInDict(DAY_NAMES_INTL_PT_DICT, partialText, NaN, [COLLATOR_LENIENT]);
}

/** A day name in portuguese */
export const DAY_NAMES_PT_REGEX = matchPartialItem(LOC, DAY_NAMES_INTL_PT_DICT, {flags:"i"});

export const TIME_OF_DAYS_PT = [ "madrugada", "manhã", "meio-dia", "tarde", "início da noite", "noite" ];
export const TIME_OF_DAYS_PT_REGEX = matchPartialItem(LOC, TIME_OF_DAYS_PT);

/** ulitma, ultimo, proxima, proximo,  */
export const PREFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT: { [word: string]: RELATIVE_DAY } = {
  "próximo": RELATIVE_DAY.NEXT_OCCURING,
  "próxima": RELATIVE_DAY.NEXT_OCCURING,
  "última": RELATIVE_DAY.PREVIOUS_OCCURING,
  "último": RELATIVE_DAY.PREVIOUS_OCCURING ,
  "nesta": RELATIVE_DAY.OF_CURRENT_WEEK,
  "este": RELATIVE_DAY.OF_CURRENT_WEEK 
}
export const PREFIX_RELATIVES_FOR_DAYS_REGEX = matchPartialItem(LOC, PREFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT, { flags:"i"});
export function parsePrefixRelativeForDay(text:string) {
  const offset = findPartialInDict<RELATIVE_DAY>(PREFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT, text, NaN, [COLLATOR_LENIENT]);
  return offset;
}


/** ultima, antes, anterior, passado, passada, em oito, às oito */
export const SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT: { [word: string]: RELATIVE_DAY } = {
  "última": RELATIVE_DAY.PREVIOUS_OCCURING,
  "último": RELATIVE_DAY.PREVIOUS_OCCURING,
  "antes": RELATIVE_DAY.PREVIOUS_OCCURING,
  "anterior": RELATIVE_DAY.PREVIOUS_OCCURING,
  "em oito": RELATIVE_DAY.OF_NEXT_WEEK,
  "passada": RELATIVE_DAY.PREVIOUS_OCCURING,
  "passado": RELATIVE_DAY.PREVIOUS_OCCURING
}
/** parses entries from {@link SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT} */
export const SUFFIX_RELATIVES_FOR_DAYS_REGEX = matchPartialItem(LOC, SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT, { flags:"i"});
export function parseSuffixRelativeForDay(text:string) {
  const offset = findPartialInDict<RELATIVE_DAY>(SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT, text, NaN, [COLLATOR_LENIENT]);
  return offset;
}

/** relative day names in portuguese :
 * Example : hoje (today), ontem (yesterday), amanhã (tomorrow)...
 */
export const DAY_NAME_RELATIVES_PT_DICT: {[key in string] : string } = {
  "hoje" : "hoje",
  ontem : "ontem",
  amanhã:  "amanhã",
  "anteontem" : "anteontem",
  "depois de amanhã" : "depois de amanhã",
}
/** match items */
export const DAY_NAMES_RELATIVE_PT_PARTIAL_REGEX = matchPartialItem(LOC, DAY_NAME_RELATIVES_PT_DICT, {flags: "i"});

/**  finds a day number (0-based) from it start, returns -1 if no match 
 * 
 * @see {@link DAY_NAMES_RELATIVE_PT_PARTIAL_REGEX}
*/
export function findDayFromStartPt(key:string):number {
  const lowerKey = key.toLowerCase()
  //return DAY_NAMES_INTL_PT.findIndex((x) => x.startsWith(lowerKey));
  return findPartialInDict(DAY_NAMES_INTL_PT_DICT, key, -1, [COLLATOR_LENIENT])
}
//#endregion

//#region Months parsing

// computed constants from Intl lib
// this does not include variants like 'jänner' or 'feber'
export const MONTH_NAMES_LONG_INTL_PT_DICT = dictFromArrays(LOC, 
  getIntlMonthNames(LOC, "long")
    // , MONTH_NAMES_PT_INTL.map(stripDiacritics).map(x => MONTH_NAMES_PT_INTL.includes(x) ? null : x)
  );
export const MONTH_NAMES_MIX_INTL_PT_DICT = dictFromArrays(LOC, 
  getIntlMonthNames(LOC, "long"), 
    getIntlMonthNames(LOC, "short"), 
    getIntlMonthNames(LOC, "narrow"),
  );

export const MONTH_NAME_PATTERN_REGEX = matchAnyItem(LOC, MONTH_NAMES_MIX_INTL_PT_DICT, {flags:"i"});
export const MONTH_NAMES_PARTIAL_PT_REGEX = matchPartialItem(LOC, MONTH_NAMES_MIX_INTL_PT_DICT, {flags:"i"});

// return -1 if no result
export function parseMonthNamePt(name: string, def:number = -1): number {
  return findPartialInDict(MONTH_NAMES_MIX_INTL_PT_DICT, name, def, [LOC]);
}


export const TIME_OF_DAY_PATTERN= `(${TIME_OF_DAYS_PT_REGEX})|(à\s*)?([0-1][0-9]|2[0-3]|[0-9])\b(:\d{1,2}|\s+heures)?`
export const TIME_OF_DAY_REGEX = new RegExp(TIME_OF_DAY_PATTERN, "i");
  
 
//#region year parsing
// pattern for a year, with 2 or 4 digits
  // copied from wanasit/chrono/src/locale/de/constants.ts

export const ERA_PATTERN = `(AC|AEC|DC|EC)\\.?)?`
export function parseEraPt(match:string):number {
  switch (match.toLocaleLowerCase(LOC)) {
    case "ac" : return -1 // Antes de Cristo" (AC)
    case "aec" : return -1 // "Antes da Era Comum" (AEC)
    case "dc" : return 1 // "Depois de Cristo" (DC)
    case "ec" : return 1  // "Era Comum" (EC)
    default:
      if (/av/i.test(match)) {
        // av. J.-C av JC 
        return -1
      } else {
        return 1;
      }
  }
}
export const YEAR_PATTERN_PT = `(?:-?[0-9]{1,4})`;
export const YEAR_REGEX_PT= new RegExp(YEAR_PATTERN_PT, "i")
export const YEAR_ERA_PATTERN_PT = `${YEAR_PATTERN_PT}(?:\\s*${ERA_PATTERN}`;
export function parseYear(match: string | RegExpExecArray): number {
    const parts = typeof match == "string" ? YEAR_REGEX_PT.exec(match) : match;
    if (!parts) return NaN;
    let rawYearNumber = parseInt(match[1]);
    if (match[2]) {
      if (rawYearNumber > 0) {
        rawYearNumber = parseEraPt(match[2]) * rawYearNumber;
      }
    }
    return findMostLikelyADYear(rawYearNumber);
}

//#region date expressions

// le mois prochain : próximo mês, no próximo mês, mês que vem, mês seguinte
// la semaine prochaine : próxima semana, na próxima semana, semana que vem, semana seguinte
// dans 3 semaines : em 3 semanas
// il y a 3 semaines : 3 semanas atrás, Há 3 semanas
// il y a 3 ans : 3 anos atrás, Há 3 anos

type SupportedUnits = "d" | "w" | "mo" | "y"
export const UNITS_DICTIONARY_PT: { [word: string]: SupportedUnits } = {
  "dia": "d",
  "semana": "w",
  "mês": "mo",
  "ano": "y",
}



// dates with ordinal numbers

/** date with ordinal : 1er janvier, */
export const ORDINAL_DATE_PT = seq({flags:"i"}
  , named("D",ORDINAL_NUMBER_PT_REGEX)
  , opt(/\s+/, named("M", MONTH_NAMES_PARTIAL_PT_REGEX)));

export function parseOrdinalDatePt(match:RegExpMatchArray):DateComponents {
  const D = match.groups["D"]
  const M = match.groups["M"]
  const day = D ? parseInt(D): parseOrdinalNumberPatternPt(D)
  const month = 1+ (M ? parseMonthNamePt(M, dayjs().month()) : dayjs().month());
  const year = dayjs().year()
  return { day, month, year };
}

/** ex : segunda-feira da semaina 2 do ano 2024 */

export const REG_JOUR_SEMAINE_X_PT = seq({}
  , named("dayname", DAY_NAMES_PT_REGEX),
  /(?:\s+da)?/,
  /\s+sem(?:a(?:na?)?)?/,
  /\s+/,
  named("week", alt({}, WEEK_NUMBER_REG, matchPartialItem(LOC, SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT) )),
  opt(/\s+/, opt(/do\s+/, opt(/ano\s+/)), named("year", YEAR_VALUE_4_REG)))

/** @see {@link REG_JOUR_SEMAINE_X_PT} */
export function extractJourSemaineXPt(match:RegExpMatchArray, refDate:Dayjs):DateComponents {
  if (match == undefined) return {}
    const day = findDayFromStartPt(match.groups["dayname"])
    const weekRef = match.groups["week"].toLowerCase()
    const yearGroup = match.groups["year"]
    const year = yearGroup ? parseInt(yearGroup) : new Date().getFullYear()
    let weekNum = 1
    const rel:RELATIVE_DAY = findPartialInDict<RELATIVE_DAY>(SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT, weekRef, undefined, [ COLLATOR_LENIENT ]);
    if (rel !== undefined) {
      weekNum = refDate.isoWeek() + (rel == RELATIVE_DAY.NEXT_OCCURING || rel == RELATIVE_DAY.OF_NEXT_WEEK ? 1 : -1)
    } else {
      // if it is not a relation, is must be a week number
      weekNum = parseInt(weekRef);
    }

    return computeDateFromWeek(year, weekNum, day)
}

/** @see {@link REG_JOUR_SEMAINE_X_PT} */
export function parseJourSemaineXPt(text:string, refDate:Dayjs = dayjs().locale(LOC)) {
  const r = REG_JOUR_SEMAINE_X_PT
  return extractJourSemaineXPt(REG_JOUR_SEMAINE_X_PT.exec(text), refDate)
}

// ----------------------------------------------------------------
/** ex : próxima terça-feira..... */
// export const REG_PREFIX_RELATIVE_DAY_PT_OLD = new RegExp(`(?<rel>${regSrc(PREFIX_RELATIVES_FOR_DAYS_REGEX)})\\s+(?<day>${regSrc(DAY_NAMES_PT_REGEX)})`,"i")
export const REG_PREFIX_RELATIVE_DAY_PT =
seq({flags:"i"}, named("rel",PREFIX_RELATIVES_FOR_DAYS_REGEX), /\s+/, named("day", DAY_NAMES_PT_REGEX))

export function extractRegPrefixRelativeDayPt(match:RegExpMatchArray, from:Dayjs) {
  if (match) {
    const dayNum = parseDayNamePt(match.groups["day"])
    const dayRel = parsePrefixRelativeForDay(match.groups["rel"])
    if (!isNaN(dayNum)) {
      return computeRelativeDay(dayNum, dayRel, dayjs(from))
    }
  }
}
export function parseRegPrefixRelativeDayPt(text:string, from:Dayjs = dayjs().locale(LOC)) {
  return extractRegPrefixRelativeDayPt(REG_PREFIX_RELATIVE_DAY_PT.exec(text), from)
}

// ----------------------------------------------------------------
/** ex : Segunda-feira antes de/Segunda-feira antes/Segunda-feira anterior, Quarta-feira em oito/Quarta-feira às oito..... */
// export const REG_SUFFIX_RELATIVE_DAY_PT_OLD = new RegExp(`(?<day>${regSrc(DAY_NAMES_PT_REGEX)})\\s+(?<rel>${regSrc(SUFFIX_RELATIVES_FOR_DAYS_REGEX)})`,"i")
export const REG_SUFFIX_RELATIVE_DAY_PT =seq({flags:"i"}, named("day", DAY_NAMES_PT_REGEX), /\s+/, named("rel",SUFFIX_RELATIVES_FOR_DAYS_REGEX))
export function extractRegSuffixRelativeDayPt(match:RegExpMatchArray, refDate:Dayjs) {
  if (match) {
    const dayNum = parseDayNamePt(match.groups["day"])
    const dayRel = parseSuffixRelativeForDay(match.groups["rel"])
    if (!isNaN(dayNum)) {
      return computeRelativeDay(dayNum, dayRel, dayjs(refDate))
    }
  }
}
export function parseRegSuffixRelativeDayPt(text:string, refDate:Dayjs = dayjs().locale(LOC)) {
  return extractRegSuffixRelativeDayPt(REG_SUFFIX_RELATIVE_DAY_PT.exec(text), refDate)
}



