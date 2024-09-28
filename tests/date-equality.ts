/** a date comparator for Jest
 * 
 *  Usage : just import to allow 'toEqual' to test for date equality
 */

import {expect} from '@jest/globals';
import dayjs, { Dayjs } from 'dayjs';
import timeZone from "dayjs/plugin/timezone"
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import moment, { isDate } from 'moment';
import { isObject } from 'util';
import { dateComponentsToDate, isDateComponents } from '../src/types';

dayjs.extend(timeZone)

// Add a a Jest equality testers for dates
// https://jestjs.io/docs/expect#expectaddequalitytesterstesters

/** Compare 2 dates with dayjs.isSame at a second resolution
 * parameters are converted using dayjs() function, which always uses local time
 */
function areDateEquals(a:any, b:any):boolean | undefined {
    const myTz = dayjs.tz.guess();

    if (isDateComponents(a)) a = dateComponentsToDate(a);
    if (isDateComponents(b)) b = dateComponentsToDate(b);
    
    const dbgAsIsDayjs = dayjs.isDayjs(a)
    const dbgBsIsDayjs = dayjs.isDayjs(b)
    if ((dayjs.isDayjs(a) || a instanceof Date) && (dayjs.isDayjs(b) || b instanceof Date)) {
        const A = dayjs(a); // .tz(myTz)
        const B = dayjs(b); // .tz(myTz)

        console.log(`areDateEquals(${A.toISOString()}, ${B.toISOString()})`)
      
        const x = A.isSame(B, "seconds")

        return A.isSame(B, "seconds");
    }
    // not dayjs, may be a DateComponents
    if (a !== null && typeof a === 'object' && "year" in a && "month" in a && "day" in a) {
        a = new Date(a.year, a.month, a.day)
    }
    if (b !== null && typeof b === 'object' && "year" in b && "month" in b && "day" in b) {
        b = new Date(b.year, b.month, b.day)
    }
    return undefined;
}

expect.addEqualityTesters([areDateEquals]);