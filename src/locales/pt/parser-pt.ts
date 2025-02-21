
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/fr';
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Chrono, Parser, Component } from "chrono-node";

import { ChronoLocale, NamedChronoParser, toDateComponents } from "../../types";
import { getIntlWeekdayNames, getIntlWeekStart } from "../../utils/intl";
import { NLDParserBase } from "../NLDParserBase";
import { extractRegPrefixRelativeDayPt, extractRegSuffixRelativeDayPt, MONTH_NAME_PATTERN_REGEX, MONTH_NAMES_MIX_INTL_PT_DICT, MONTH_NAMES_PARTIAL_PT_REGEX, ORDINAL_DATE_PT, ORDINAL_NUMBER_PT_REGEX, parseOrdinalDatePt, REG_PREFIX_RELATIVE_DAY_PT, REG_SUFFIX_RELATIVE_DAY_PT } from "./constants-pt";
import { extractJourSemaineXPt } from "./constants-pt";
import { REG_JOUR_SEMAINE_X_PT } from "../pt/constants-pt";


const LOC = "pt"

dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)
dayjs.locale("LOC")

export default class NLDParserPt extends NLDParserBase {


  constructor(someLocale: ChronoLocale = LOC) {
    super(someLocale)
  }

  override moment(date:Date):Dayjs {
    return dayjs(date).locale(this.locale)
  }
  
  protected override configureChrono(chrono:Chrono): Chrono {
    super.configureChrono(chrono)
    // logInfoAboutChrono();

    chrono.parsers.push(
      ParserXmasPt,
      ParserNewYearPt,
      ParserOrdinalDatePt,
      ParserDayOfNumberedWeekPt,
      ParserPrefixRelativeDayPt,
      ParserSuffixRelativeDayPt
    );


    return chrono;
  }
}

export const ParserXmasPt:NamedChronoParser = {
  name:"ParserXmasPt",
  pattern: () => {
    return /\bNatal\b/i;
  },
  extract: () => {
    return {
      day: 25,
      month: 12,
    };
  },
}

export const ParserNewYearPt:NamedChronoParser = {
  name:"ParserNewYearPt",
  pattern: () => {
    return /\bano\s+novo\b(?:\s+(?:de\s+)?(?<year>\d{4}))?/i;
  },
  extract: (context, match) => {
    return {
      day: 1,
      month: 1, // month are 1 based in dayjs
      ...(match.groups["year"] ? { year: parseInt(match.groups["year"])} : {})
    };
  },
}

export const ParserOrdinalDatePt:NamedChronoParser = {
  name:"ParserOrdinalDatePt",
  pattern: () =>  ORDINAL_DATE_PT,
  extract: (_context, match) => parseOrdinalDatePt(match)
} 


export const ParserDayOfNumberedWeekPt:NamedChronoParser = {
  name: "ParserDayOfNumberedWeekPt",
  pattern: () =>  REG_JOUR_SEMAINE_X_PT,
  extract: (_context, match) => extractJourSemaineXPt(match, dayjs(_context.refDate).locale(LOC))
}

export const ParserPrefixRelativeDayPt:NamedChronoParser = {
  name: "ParserPrefixRelativeDayPt",
  pattern: () =>  {
    return REG_PREFIX_RELATIVE_DAY_PT
  },
  extract: (_context, match) => toDateComponents(extractRegPrefixRelativeDayPt(match, dayjs(_context.refDate).locale(LOC)))
}

export const ParserSuffixRelativeDayPt:NamedChronoParser = {
  name: "ParserSuffixRelativeDayPt",
  pattern: () => { 
    return REG_SUFFIX_RELATIVE_DAY_PT 
  },
  extract: (_context, match) => {
    return toDateComponents(extractRegSuffixRelativeDayPt(match, dayjs(_context.refDate).locale(LOC)))
  }
}


function logInfoAboutChrono() {
  console.log("Week day names (computed)");
    console.log(getIntlWeekdayNames("de", "long"));
    console.log(getIntlWeekdayNames("de", "short"));
    console.log(getIntlWeekdayNames("de", "narrow"));
    console.log("Month names (constant)");
    console.log(MONTH_NAMES_MIX_INTL_PT_DICT);

    const REG_ORDINAL_FR = new RegExp(ORDINAL_NUMBER_PT_REGEX, "i");
    console.log(REG_ORDINAL_FR);
    console.log(REG_ORDINAL_FR.test("1."))
    console.log(REG_ORDINAL_FR.test("8."))
    console.log(REG_ORDINAL_FR.test("ertse"))
    console.log(REG_ORDINAL_FR.test("achten"))

    
    const regMonthPt = new RegExp(MONTH_NAME_PATTERN_REGEX.source, "i");
    console.log(regMonthPt);
    console.log(regMonthPt.test("Juli"))
    console.log(regMonthPt.test("August"))
    console.log(regMonthPt.test("März"))

    
    console.log(`MONTH_NAMES_FR_REGEX : ${MONTH_NAMES_PARTIAL_PT_REGEX}`);
    console.log(MONTH_NAMES_PARTIAL_PT_REGEX.test("Juli"))
    console.log(MONTH_NAMES_PARTIAL_PT_REGEX.test("August"))
    console.log(MONTH_NAMES_PARTIAL_PT_REGEX.test("März"))
    console.log(MONTH_NAMES_PARTIAL_PT_REGEX.test("märz"))
    console.log(MONTH_NAMES_PARTIAL_PT_REGEX.test("mar"))
    console.log(MONTH_NAMES_PARTIAL_PT_REGEX.test("m"))
}