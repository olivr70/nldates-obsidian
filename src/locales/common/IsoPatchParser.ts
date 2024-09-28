import { Parser } from "chrono-node";
import { DateComponents } from "src/types";
import { extractIsoDateZulu, REG_ISO_DATE_ZULU } from "./constants";

/** a Parser which handles :
 * - ISO dates with Z indicator
 * - signed years
 *    years from 10000 must have a + sign
 *    years before christ can have a - sign
 *    year 0000 is 1 BCE (-1)
 * like 2024-01-01Z, which although not ISO compliant, is supported by
 * Javascript new Date() and dayjs()
 * 
 *  To stick to Chrono choices, defaults to time 12:00 (noon)
 * 
 * This is not supported by current version of Chrono (2.7.6)
*/
export const IsoPatchParser:Parser = {
    pattern: () => {
      return REG_ISO_DATE_ZULU;
    },
    extract: (_context, match) => extractIsoDateZulu(match)
}