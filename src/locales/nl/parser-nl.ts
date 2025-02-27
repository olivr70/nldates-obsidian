
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/nl';
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Chrono } from "chrono-node";

import { ChronoLocale } from "../../types";
import { NLDParserBase } from "../NLDParserBase";
import { getIntlWeekStart } from "../../utils/intl";


dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)
dayjs.locale("fr")

export default class NLDParserNl extends NLDParserBase {


  constructor(someLocale: ChronoLocale = "nl") {
    super(someLocale)
  }

  
  moment(date:Date):Dayjs {
    return dayjs(date).locale(this.locale)
  }
  
  getFormattedDate(date:Date, format: string):string {
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
        return /\bNieuwe?\b(?:\s+(?:in\s+)?(?<year>\d{4}))?/i;
      },
      extract: (context, match) => {
        return {
          day: 1,
          month: 1, // month are 1 based in dayjs
          ...(match.groups["year"] ? { year: parseInt(match.groups["year"])} : {})
        };
      },
    });

    return chrono;
  }
}


