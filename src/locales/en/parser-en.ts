import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat"
import 'dayjs/locale/en';
import 'dayjs/locale/en-au';
import 'dayjs/locale/en-ca';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/en-ie';
import 'dayjs/locale/en-in';
import 'dayjs/locale/en-nz';
import 'dayjs/locale/en-sg';
import 'dayjs/locale/en-tt';
import { Chrono, Parser } from "chrono-node";

dayjs.locale("en")

dayjs.locale("en-CA")
dayjs.locale("en-GB")
dayjs.locale("en-IE")
dayjs.locale("en-IN")
dayjs.locale("en-BZ")
dayjs.locale("en-SG")
dayjs.locale("en-TT")

dayjs.extend(localizedFormat)

import { 
  ChronoLocale
} from "../../types";
import { NLDParserBase } from "../NLDParserBase"

import {
  getLastDayOfMonth
} from "../../utils/tools";
import { matchAnyPattern } from "../../utils/regex";
import { IsoPatchParser } from "../common/IsoPatchParser";
import { IsoPatchWeekDateTzdParser } from "../common/IsoPatchWeekDateTzdParser";
import { IsoEraDateParser } from "../common/IsoEraDateParser";
import { getIntlWeekStart } from "src/utils/intl";


export default class NLDParserEn extends NLDParserBase {

  // @throws RangeError if locale is not valid and not "en"
  constructor(someLocale: string) {
    super(someLocale);
    if (!someLocale.startsWith("en")) {
      throw new RangeError(`Locale for NLDParseEn must be an english locale. Got ${someLocale}`)
    }
  }

  
  moment(date: Date): dayjs.Dayjs {
    return dayjs(date).locale(this.locale)
  }


  getParsedDate(selectedText: string): Date {
    const myChrono = this.chrono;
    const initialParse = myChrono.parse(selectedText);
    const weekdayIsCertain = initialParse[0]?.start.isCertain("weekday");

    const locale = {
      weekStart: getIntlWeekStart(this.locale),
    };

    const thisDateMatch = selectedText.match(/this\s([\w]+)/i);
    const nextDateMatch = selectedText.match(/next\s([\w]+)/i);
    const lastDayOfMatch = selectedText.match(/(last day of|end of)\s*([^\n\r]*)/i);
    const midOf = selectedText.match(/mid\s([\w]+)/i);

    const referenceDate = weekdayIsCertain
      ? dayjs().weekday(0).toDate()
      : new Date();

    if (thisDateMatch && thisDateMatch[1] === "week") {
      return myChrono.parseDate(`this ${locale.weekStart}`, referenceDate);
    }

    if (nextDateMatch && nextDateMatch[1] === "week") {
      return myChrono.parseDate(`next ${locale.weekStart}`, referenceDate, {
        forwardDate: true,
      });
    }

    if (nextDateMatch && nextDateMatch[1] === "month") {
      const thisMonth = myChrono.parseDate("this month", new Date(), {
        forwardDate: true,
      });
      return myChrono.parseDate(selectedText, thisMonth, {
        forwardDate: true,
      });
    }

    if (nextDateMatch && nextDateMatch[1] === "year") {
      const thisYear = myChrono.parseDate("this year", new Date(), {
        forwardDate: true,
      });
      return myChrono.parseDate(selectedText, thisYear, {
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

    return myChrono.parseDate(selectedText, referenceDate);
  }

  
  getFormattedDate(date:Date, format: string):string {
    console.log(`NLDParserEN.getFormattedDate ${date} ${format}`)
    return dayjs(date).locale(this.locale).format(format);
  }
  
  protected override configureChrono(chrono:Chrono): Chrono {
    // Add some add a patch for ISO date parsing (limitations of Chrono
    // add a patch for ISO week date parsing (not supported by Chrono)
    // chrono.parsers= [ IsoPatchWeekDateTzdParser, IsoPatchParser,  ...chrono.parsers]
    // Christmas
    super.configureChrono(chrono);
    // Christmas
    chrono.parsers.push({
      pattern: () => {
        return /\bChristmas\b/i;
      },
      extract: () => {
        return {
          day: 25,
          month: 12,
        };
      },
    });
  
    chrono.parsers.push({
      pattern: () => new RegExp(ORDINAL_NUMBER_PATTERN_EN),
      extract: (_context, match) => {
        return {
          day: parseOrdinalNumberPattern(match[0]),
          month: dayjs().month(),
        };
      },
    } as Parser);
    return chrono;
  }
}


const ORDINAL_WORD_DICTIONARY: { [word: string]: number } = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  "twenty first": 21,
  "twenty-first": 21,
  "twenty second": 22,
  "twenty-second": 22,
  "twenty third": 23,
  "twenty-third": 23,
  "twenty fourth": 24,
  "twenty-fourth": 24,
  "twenty fifth": 25,
  "twenty-fifth": 25,
  "twenty sixth": 26,
  "twenty-sixth": 26,
  "twenty seventh": 27,
  "twenty-seventh": 27,
  "twenty eighth": 28,
  "twenty-eighth": 28,
  "twenty ninth": 29,
  "twenty-ninth": 29,
  thirtieth: 30,
  "thirty first": 31,
  "thirty-first": 31,
};


const ORDINAL_NUMBER_PATTERN_EN = `(?:${matchAnyPattern(
  ORDINAL_WORD_DICTIONARY
)}|[0-9]{1,2}(?:st|nd|rd|th)?)`;

function parseOrdinalNumberPattern(match: string): number {
  let num = match.toLowerCase();
  if (ORDINAL_WORD_DICTIONARY[num] !== undefined) {
    return ORDINAL_WORD_DICTIONARY[num];
  }

  num = num.replace(/(?:st|nd|rd|th)$/i, "");
  return parseInt(num);
}