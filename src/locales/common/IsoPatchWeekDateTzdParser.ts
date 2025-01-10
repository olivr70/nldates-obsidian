import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday"
import weekOfYear from "dayjs/plugin/weekOfYear"

import { Parser } from "chrono-node";
import { DateComponents } from "src/types";
import { extractIsoWeekDateTzd, regIsoWeekDateTzd } from "./constants";
import { ParsingContext } from "chrono-node/dist/esm/chrono";

dayjs.extend(weekday)
dayjs.extend(weekOfYear)

/** a Parser which handle ISO dates with Z indicator
 * like 2024-01-01Z, which although not ISO compliant, is supported by
 * Javascript new Date() and dayjs()
 * 
 *  To stick to Chrono choices, defaults to time 12:00 (noon)
 * 
 * This is not supported by current version of Chrono (2.7.6)
*/
export class IsoPatchWeekDateTzdParser implements Parser {
  _parser = regIsoWeekDateTzd("0");
    pattern()  {
      return this._parser;
    }
    extract(context: ParsingContext, match: RegExpMatchArray) {
      return extractIsoWeekDateTzd(match, "0")
    }

}