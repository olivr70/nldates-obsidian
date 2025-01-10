
import { Parser } from "chrono-node";
import { DateComponents } from "src/types";
import { extractIsoTimestampEra, regIsoTimestampEra } from "./constants";
/** a Parser which handles :
 * - signed years
 *    years from 10000 and above must have a + sign
 *    years before christ can have a - sign
 *    year 0000 is 1 BCE (-1)
 * 
 *  To stick to Chrono choices, defaults to time 12:00 (noon)
 * 
 * Era years are not supported by current version of Chrono (2.7.6)
*/
export const IsoEraDateParser:Parser = {
    pattern: () => {
      return regIsoTimestampEra("");
    },
    extract: (_context, match) => ({
      hour: 12, // default time of day in Chrono
      ...extractIsoTimestampEra(match, "")
      } as DateComponents)
}