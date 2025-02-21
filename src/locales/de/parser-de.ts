
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/de';
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Chrono, Parser, Component } from "chrono-node";

import { ChronoLocale } from "../../types";
import { NLDParserBase } from "../NLDParserBase";
import {
  getLastDayOfMonth,
} from "../../utils/tools";
import { MONTH_NAMES_DE_REG, MONTH_NAMES_DE_INTL_DICT, MONTH_NAMES_DE_PARTIAL_REG, ORDINAL_DATE_DE, ORDINAL_NUMBER_REG_DE, ORDINAL_WORD_DICTIONARY_DE, extractOrdinalDate, parseVergangene, REG_VERGANGENE_TAG } from "./constants-de"
import { findPartialInDict } from "../../utils/months";
import { getIntlWeekdayNames, getIntlWeekStart } from "../../utils/intl";


dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)

export default class NLDParserDe extends NLDParserBase {


  constructor(someLocale: ChronoLocale) {
    super(someLocale)
  }

  
  moment(date:Date):Dayjs {
    return dayjs(date).locale(this.locale)
  }


  getParsedDate(selectedText: string): Date {
    const myChrono = this.chrono;
    console.log("------------- DE.getParsedDate() ------------- ")
    console.log(`ChronoDE.parseDate ${selectedText}`)

    const initialParse = myChrono.parse(selectedText);

    const weekdayIsCertain = initialParse[0]?.start.isCertain("weekday");

    const locale = {
      weekStart: getIntlWeekStart(this.locale),
    };
    

    const thisDateMatch = selectedText?.match(/diese[mnrs]?\s([\w]+)/i);
    const nextDateMatch = selectedText?.match(/n(ä|ae,)chsten\s([\w]+)/i);
    const lastDayOfMatch = selectedText?.match(/(letzer tag im|ende)\s*([^\n\r]*)/i);
    const midOf = selectedText?.match(/mid\s([\w]+)/i);

    const referenceDate = weekdayIsCertain
      ? dayjs().weekday(0).toDate()
      : new Date();

    if (thisDateMatch && thisDateMatch[1] === "week") {
      return myChrono.parseDate(`this ${locale.weekStart}`, referenceDate);
    }

    if (nextDateMatch && nextDateMatch[1] === "week") {
      return myChrono.parseDate(`nächste ${locale.weekStart}`, referenceDate, {
        forwardDate: true,
      });
    }

    if (nextDateMatch && nextDateMatch[1] === "monat") {
      const nextMonth = myChrono.parseDate("nächsten monat", new Date(), {
        forwardDate: true,
      });
      return myChrono.parseDate(selectedText, nextMonth, {
        forwardDate: true,
      });
    }

    if (nextDateMatch && nextDateMatch[1] === "jahre") {
      const nextYear = myChrono.parseDate("nächsten jahre", new Date(), {
        forwardDate: true,
      });
      return myChrono.parseDate(selectedText, nextYear, {
        forwardDate: true,
      });
    }

    if (lastDayOfMatch) {
      const tempDate = myChrono.parse(lastDayOfMatch[2]);
      const year = tempDate[0].start.get("year");
      const month = tempDate[0].start.get("month");
      const lastDay = getLastDayOfMonth(year, month);

      return myChrono.parseDate(`${year}-${month}-${lastDay}`, new Date(), {
        forwardDate: true,
      });
    }

    if (midOf) {
      return myChrono.parseDate(`${midOf[1]} 15th`, new Date(), {
        forwardDate: true,
      });
    }

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
        return /\bweihnachten\b/i;
      },
      extract: () => {
        return {
          day: 25,
          month: 12,
        };
      },
    });
  

    chrono.parsers.push({
      pattern: () =>  ORDINAL_DATE_DE,
      extract: (_context, match) => extractOrdinalDate(match)
    } as Parser);

    chrono.parsers.push({
      pattern: () => REG_VERGANGENE_TAG,
      extract: (_context, match) => parseVergangene(match)
    } as Parser)

    return chrono;
  }
}




function logInfoAboutChrono() {
  console.log("Week day names (computed)");
    console.log(getIntlWeekdayNames("de", "long"));
    console.log(getIntlWeekdayNames("de", "short"));
    console.log(getIntlWeekdayNames("de", "narrow"));
    console.log("Month names (constant)");
    console.log(MONTH_NAMES_DE_INTL_DICT);

    console.log(ORDINAL_NUMBER_REG_DE);
    console.log(ORDINAL_NUMBER_REG_DE.test("1."))
    console.log(ORDINAL_NUMBER_REG_DE.test("8."))
    console.log(ORDINAL_NUMBER_REG_DE.test("ertse"))
    console.log(ORDINAL_NUMBER_REG_DE.test("achten"))

    
    const REG_MONTH_DE = new RegExp(MONTH_NAMES_DE_REG, "i");
    console.log(REG_MONTH_DE);
    console.log(REG_MONTH_DE.test("Juli"))
    console.log(REG_MONTH_DE.test("August"))
    console.log(REG_MONTH_DE.test("März"))

    
    console.log(`MONTH_NAMES_DE_REGEX : ${MONTH_NAMES_DE_PARTIAL_REG}`);
    console.log(MONTH_NAMES_DE_PARTIAL_REG.test("Juli"))
    console.log(MONTH_NAMES_DE_PARTIAL_REG.test("August"))
    console.log(MONTH_NAMES_DE_PARTIAL_REG.test("März"))
    console.log(MONTH_NAMES_DE_PARTIAL_REG.test("märz"))
    console.log(MONTH_NAMES_DE_PARTIAL_REG.test("mar"))
    console.log(MONTH_NAMES_DE_PARTIAL_REG.test("m"))
}