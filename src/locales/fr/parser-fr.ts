
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/fr';
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Chrono, Parser, Component } from "chrono-node";

import { ChronoLocale, toDateComponents } from "../../types";
import { NLDParserBase } from "../NLDParserBase";
import { ORDINAL_DATE_FR, extractOrdinalDate, parsePreviousDayFr, REG_FOLLOWING_DAY_FR, REG_JOUR_SEMAINE_X, extractJourSemaineX, extractRegRelativeDayFr, REG_RELATIVE_DAY_FR } from "./constants-fr"
import { getIntlWeekStart } from "../../utils/intl";


dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)
dayjs.locale("fr")

export default class NLDParserFr extends NLDParserBase {


  constructor(someLocale: ChronoLocale = "fr") {
    super(someLocale)
  }

  
  moment(date:Date):Dayjs {
    return dayjs(date).locale(this.locale)
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
        return /\bNouvel(?:\s+|\s*[-]\s*)An\b(?:\s+(?<year>\d{4}))?/i;
      },
      extract: (context, match) => {
        return {
          day: 1,
          month: 1, // month are 1 based in dayjs
          ...(match.groups["year"] ? { year: parseInt(match.groups["year"])} : {})
        };
      },
    });

    chrono.parsers.push({
      pattern: () =>  ORDINAL_DATE_FR,
      extract: (_context, match) => extractOrdinalDate(match)
    } as Parser);
    
    chrono.parsers.push({
      pattern: () =>  REG_FOLLOWING_DAY_FR,
      extract: (_context, match) => parsePreviousDayFr(match)
    } as Parser);
    
    chrono.parsers.push({
      pattern: () =>  REG_JOUR_SEMAINE_X,
      extract: (_context, match) => extractJourSemaineX(match, _context.refDate)
    } as Parser);
    
    chrono.parsers.push({
      pattern: () =>  REG_RELATIVE_DAY_FR,
      extract: (_context, match) => toDateComponents(extractRegRelativeDayFr(match, _context.refDate))
    } as Parser);


    return chrono;
  }
}