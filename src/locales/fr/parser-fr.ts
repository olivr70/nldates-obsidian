
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/fr';
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Chrono, Parser, Component } from "chrono-node";

import { DayOfWeek, ChronoLocale } from "../../types";
import { NLDParserBase } from "../NLDParserBase";
import {
  getLastDayOfMonth,
  getLocaleWeekStart,
  getWeekNumber,
} from "../../utils";
import { DAY_NAMES_FR_INTL, MONTH_NAME_PATTERN_FR, MONTH_NAMES_FR_INTL, MONTH_NAMES_MIX_FR_INTL_DICT, MONTH_NAMES_FR_PARTIAL3_REGEX, MONTH_NAMES_PARTIAL3_PATTERN_FR, ORDINAL_DATE_FR, ORDINAL_NUMBER_PATTERN_FR, ORDINAL_WORD_DICTIONARY_FR, parseOrdinalDate, parsePreviousDayFr, REG_FOLLOWING_DAY_FR, REG_JOUR_SEMAINE_X, extractJourSemaineX } from "./constants-fr"
import { findPartialInDict } from "src/utils/months";
import { getIntlWeekdayNames } from "src/utils/intl";


dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)

export default class NLDParserFr extends NLDParserBase {


  constructor(someLocale: ChronoLocale) {
    super(someLocale)
  }

  
  moment(date:Date):Dayjs {
    return dayjs(date).locale(this.locale)
  }


  getParsedDate(selectedText: string, weekStartPreference: DayOfWeek): Date {
    const myChrono = this.chrono;
    console.log("------------- FR.getParsedDate() ------------- ")
    console.log(`ChronoFR.parseDate ${selectedText}`)

    const initialParse = myChrono.parse(selectedText);
    console.log(`initialParse result ${initialParse}`)
    console.log(initialParse);

    const weekdayIsCertain = initialParse[0]?.start.isCertain("weekday");

    const weekStart =
      weekStartPreference === "locale-default"
        ? getLocaleWeekStart()
        : weekStartPreference;

    const locale = {
      weekStart: getWeekNumber(weekStart),
    };
    
    const referenceDate = weekdayIsCertain
      ? dayjs().weekday(0).toDate()
      : new Date();


    return myChrono.parseDate(selectedText, referenceDate );
  }

  
  getFormattedDate(date:Date, format: string):string {
    // console.log(`NLDParserDe.getFormattedDate ${date} ${format}`)
    // console.log(this)
    // console.log(dayjs(date).format(format))
    // console.log(dayjs(date).locale(this.locale).format(format))
    return dayjs(date).locale(this.locale).format(format);
  }
  
  protected override configureChrono(chrono:Chrono): Chrono {
    super.configureChrono(chrono)
    // logInfoAboutChrono();

    chrono.parsers.push({
      pattern: () => {
        return /\bNoël\b/i;
      },
      extract: () => {
        return {
          day: 25,
          month: 12,
        };
      },
    });
  
    
    chrono.parsers.push({
      pattern: () => {
        return /\bNouvel-An\b/i;
      },
      extract: () => {
        return {
          day: 1,
          month: 0,
        };
      },
    });

    chrono.parsers.push({
      pattern: () =>  ORDINAL_DATE_FR,
      extract: (_context, match) => parseOrdinalDate(match)
    } as Parser);
    
    chrono.parsers.push({
      pattern: () =>  REG_FOLLOWING_DAY_FR,
      extract: (_context, match) => parsePreviousDayFr(match)
    } as Parser);
    
    chrono.parsers.push({
      pattern: () =>  REG_JOUR_SEMAINE_X,
      extract: (_context, match) => extractJourSemaineX(match, new Date())
    } as Parser);


    return chrono;
  }
}




function logInfoAboutChrono() {
  console.log("Week day names (computed)");
    console.log(getIntlWeekdayNames("de", "long"));
    console.log(getIntlWeekdayNames("de", "short"));
    console.log(getIntlWeekdayNames("de", "narrow"));
    console.log("Month names (constant)");
    console.log(MONTH_NAMES_MIX_FR_INTL_DICT);

    const REG_ORDINAL_FR = new RegExp(ORDINAL_NUMBER_PATTERN_FR, "i");
    console.log(REG_ORDINAL_FR);
    console.log(REG_ORDINAL_FR.test("1."))
    console.log(REG_ORDINAL_FR.test("8."))
    console.log(REG_ORDINAL_FR.test("ertse"))
    console.log(REG_ORDINAL_FR.test("achten"))

    
    const REG_MONTH_FR = new RegExp(MONTH_NAME_PATTERN_FR, "i");
    console.log(REG_MONTH_FR);
    console.log(REG_MONTH_FR.test("Juli"))
    console.log(REG_MONTH_FR.test("August"))
    console.log(REG_MONTH_FR.test("März"))

    
    console.log(`MONTH_NAMES_FR_REGEX : ${MONTH_NAMES_FR_PARTIAL3_REGEX}`);
    console.log(MONTH_NAMES_FR_PARTIAL3_REGEX.test("Juli"))
    console.log(MONTH_NAMES_FR_PARTIAL3_REGEX.test("August"))
    console.log(MONTH_NAMES_FR_PARTIAL3_REGEX.test("März"))
    console.log(MONTH_NAMES_FR_PARTIAL3_REGEX.test("märz"))
    console.log(MONTH_NAMES_FR_PARTIAL3_REGEX.test("mar"))
    console.log(MONTH_NAMES_FR_PARTIAL3_REGEX.test("m"))
}