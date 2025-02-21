import { toIsoWeekDay } from "../../utils/days";
import { DateComponents } from "../../types";
import { alt, group, named, opt, regSrc, seq } from "../../utils/regex";
import { removeProperties } from "../../utils/tools";
import { findInDict } from "../../utils/months";



/** A day number in month, between 1 and 31, accepts 01 to 09 */
export const DAY_IN_MONTH_REG = seq({word:true}, /(?:3[0-1]?|[12][0-9]?|0[1-9]|[4-9])/)

// patterns for a year
  // copied from wanasit/chrono/src/locale/de/constants.ts
  /** year on exactly 4 digits 
   * exclude four 0
  */
  export const YEAR_VALUE_4_REG = /\b(?!0{4}\b)([0-9]{4}\b)/ 
  /** year on 1 to 4 digits, excluding 0,00,000 and 0000 
   * exclude list of 0 (00, 000, 0000)
  */
  export const YEAR_VALUE_REG = /\b(?!0{1,4}\b)\d{1,4}\b/
  /** signed year on 1 to 4 digits, excluding 0,00,000 and 0000 */
  export const SIGNED_YEAR_REG = seq({}, /([-+])?/, YEAR_VALUE_REG);

  /** extract data if text matches {@link SIGNED_YEAR_REG} */
export function extractSignedYear(text:string, def:number = new Date().getFullYear()):["-"|"+"|"", number] {
    const sign = (text[0] == "+" || text[0] == "-") ? text[0] : undefined;
    return [sign, parseInt(text)];
}

/** A number bewteen 1 and 53, accepting 01 to 09 */
export const WEEK_NUMBER_REG = /0[1-9]|[1-4]\d?|5[0-3]?|[6-9]/

/** Parse Z, +02, -04:45 
 * 
 * @idx is the suffix for named groups. This allows building regexes with multiple instances of tzd
*/
export function regTzd(idx:string = '') {
    return named(`tzd${idx}`, alt({},
            named(`zulu${idx}`, /Z/),
            group(named(`tzHour${idx}`, /[-+]\d{2}/), opt(/:?/, named(`tzMinute${idx}`, /\d{2}/)))))
//  return /(?<tzd>(?<zulu>Z)|(?<tzHour>[-+]\d{2}):?(?<tzMinute>\d{2})?)/
}
//                      1      2          3                     4
/** extract timezone offset information, or null if none  */ 
export function extractTzd(match:RegExpMatchArray, idx:string = ''):DateComponents {
    // The Zulu time zone (Z) is equivalent to UTC
    if (match) {
        if (match.groups[`tzd${idx}`]) {
            let timezoneOffset = undefined;
            if (match.groups[`zulu${idx}`]) {
                timezoneOffset = 0; // default (if Z is present)
            } else {
                timezoneOffset = parseInt(match.groups[`tzHour${idx}`]) * 60 
                const minuteOffset = parseInt(match.groups[`tzMinute${idx}`]) || 0 ;
                if (timezoneOffset < 0) {
                    timezoneOffset -= minuteOffset;
                } else {
                    timezoneOffset += minuteOffset;
                }
            }
            return { timezoneOffset }
        }
    }
    return {};
}
export function parseTzd(text:string):number {
    return extractTzd(regTzd("").exec(text),"")?.timezoneOffset;
}

const REG_HOURS_24 = /[01][0-9]|2[0-3]/
const REG_MINUTES = /[0-5][0-9]/
const REG_SECONDS = /[0-5][0-9]/

/** a ISO time (requires hour and minutes) 
 * Parse 10:10, 11:12.234 08:09Z
*/
export function regIsoTime(idx:string):RegExp {
    return group(/(?<!\d)/,
            group(named(`hour${idx}`, REG_HOURS_24), /:/, named(`minute${idx}`, REG_MINUTES )),
            opt(/:/, 
                named(`second${idx}`, REG_SECONDS), 
                opt(group(/\./, named(`fractions${idx}`, /\d{1,6}/)))), 
            named(`timeZulu${idx}`, /Z?/))
}

/** extract DateComponents from a match by {@link regIsoTime}
 * 
 * Note : milliseconds are clipped to 3 digits (standard accepts 6 digits)
*/
export function extractIsoTime(match:RegExpMatchArray, idx:string):DateComponents {
    if (match) {
        const hour = parseInt(match.groups[`hour${idx}`])
        const minute = parseInt(match.groups[`minute${idx}`])
        const second = parseInt(match.groups[`second${idx}`])
        const millisecond = parseInt(match.groups[`fractions${idx}`]?.substring(0,3).padEnd(3,"0"))
        const timeZulu = match.groups[`timeZulu${idx}`]
        const timezoneOffset = 0
        const result:DateComponents = {        
            hour,minute,second,millisecond ,
            ...(timeZulu ? { timezoneOffset: 0} : {})
        }
        return removeProperties(result, isNaN);
    }
    return {}
}
const cachedRegForParseIsoTime= regIsoTime("")
export function parseIsoTime(text:string):DateComponents {
    return extractIsoTime(cachedRegForParseIsoTime.exec(text), "")
}

export function regIsoTimeTzd(idx:string) { 
    return group(regIsoTime(idx), opt(regTzd(idx)))
}

/** extract DateComponents from a match by {@link regIsoTimeTzd}
 * 
 * Note : milliseconds are clipped to 3 digits (standard accepts 6 digits)
*/
export function extractIsoTimeTzd(match:RegExpMatchArray, idx:string):DateComponents {
    if (match) {
        return {...extractIsoTime(match, idx), ...extractTzd(match, idx) }
    }
    return {}
}
const cachedRegForParseIsoTimeTzd= regIsoTimeTzd("")
export function parseIsoTimeTzd(text:string):DateComponents {
    return extractIsoTimeTzd(cachedRegForParseIsoTimeTzd.exec(text),"");
}

/** an extended ISO date, with a sign, and negative years 
 * Parse -1500/05/10
*/
export function regIsoDateEra(idx:string = "")  {
    return group( 
                named(`yearEra${idx}`, /[-+]\d{4,6}/), 
                opt(
                    /-/, 
                    named(`monthEra${idx}`, /\d{2}/),
                    opt( 
                        /-/,
                        named(`dayEra${idx}`, /\d{2}/))))
}
export function extractIsoDateEra(match:RegExpMatchArray, idx:string):DateComponents {
    if (match) {
        let year = parseInt(match.groups[`yearEra${idx}`])
        if (year == 0) year = -1    // special case for year 0000
        const month = parseInt(match.groups[`monthEra${idx}`]);
        const day = parseInt(match.groups[`dayEra${idx}`]);
        const result:DateComponents = { year ,
            ...(month && { month }), 
            ...(day && { day }) }
        return result;
    }
    return {}
}
export function parseIsoDateEra(text:string):DateComponents {
    return extractIsoDateEra(regIsoDateEra().exec(text), "")
}

/** era date with time and timezone offset, like */
export function regIsoTimestampEra(idx:string = "") { return group(regIsoDateEra(idx),/T/, regIsoTimeTzd(idx)) }
export function extractIsoTimestampEra(match:RegExpMatchArray, idx:string):DateComponents {
    return {...extractIsoDateEra(match, idx), ...extractIsoTimeTzd(match, idx) }
}
export function parseIsoTimestampEra(text:string):DateComponents {
    return extractIsoTimestampEra(regIsoTimestampEra("").exec(text), "");
}

/** Compute a Date from its week number
 * 
 * @param year 
 * @param isoWeek week number, 1-based
 * @param dayInWeekJs 0-based, 0 = sunday
 * @returns 
 */
export function computeDateFromWeek(year:number, isoWeek:number, dayInWeekJs:number) {
    
    // 4th of january is always in week 1
    const fromJan4 = new Date(year,0,4 + 7*(isoWeek-1)) // local time
    const offsetToMonday = toIsoWeekDay(fromJan4.getDay()); // because in JS 0 in sunday
    const dayOffset = toIsoWeekDay(dayInWeekJs) // iso weeks start on mondays
    const result= new Date(fromJan4.setDate(fromJan4.getDate() - offsetToMonday + dayOffset));

    return {
        year: result.getFullYear(), // it may not be the same as the year in the text
        month : result.getMonth() + 1,  // January is 1
        day: result.getDate(),
    } as DateComponents;
}

/** Parse 2023-W03-1
 * groups are : isoWeekX, wYearX, wWeeksX, w, wDayX
 * @idx is the suffix for named groups. This allows building regexes with multiple instances of tzd
*/
export function regIsoWeekDate(idx:string) {
    return named(`isoWeek${idx}`,
        named(`wYear${idx}`, /[-+]?\d{4}/), 
        /-?W/, 
        named(`wWeek${idx}`, /0[0-9]|[1-4][0-9]|5[0-3]/),
        opt(/-/, named(`wDay${idx}`, /\d(?!\d)/)))
}
/** 4 groups */
export const REG_ISO_WEEK_DATE = /(?<isoWeek>(?<wYear>[-+]?\d{4})-?W(?<wWeek>0[0-9]|[1-4][0-9]|5[0-3])(?:-(?<wDay>\d(?!\d)))?)/
//                                12                                3                                     4
//                                All                               Week number                           Day number
//                                 Year
//                                                
    // note : (?!\d) because the day number is a single digit (otherwise there would a possible confusion
    // with a negative timezoneOffset)
export function extractIsoWeekDate(match:RegExpMatchArray, idx:string):DateComponents {
    if (match && match.groups[`isoWeek${idx}`]) {
        // ISO weeks always start on a Monday
        const year = parseInt(match.groups[`wYear${idx}`])
        const week = parseInt(match.groups[`wWeek${idx}`])
        const dayRef = match.groups[`wDay${idx}`]
        const dayInWeekJs = dayRef !== undefined ? parseInt(dayRef) % 7 : 1 // monday (first day of week in ISO)

        return computeDateFromWeek(year, week, dayInWeekJs)
    }
}
export function parseIsoWeekDate(text:string):DateComponents {
    return extractIsoWeekDate(regIsoWeekDate("").exec(text), "")
}


// ------------------------------------------------------------------------
/** Parse 2023-W03-1+01:15 
 * Groups : those of {@link regIsoWeekDate} and {@link regTzd}
 * 
 * @idx is the suffix for named groups. This allows building regexes with multiple instances of tzd
*/
export function regIsoWeekDateTzd(idx:string) {
    return group(regIsoWeekDate(idx), opt(regTzd(idx)))
} 
//export const REG_ISO_WEEK_DATE_TZD = new RegExp(`${regSrc(REG_ISO_WEEK_DATE)}(?:${regSrc(REG_TZD)})?`);
export function extractIsoWeekDateTzd(match:RegExpMatchArray, idx:string):DateComponents {
    const result = { ...extractIsoWeekDate(match, idx), ...extractTzd(match, idx) };
    return result;
}
export function parseIsoWeekDateTzd(text:string):DateComponents {
    const dbgReg = regIsoWeekDateTzd("")
    return extractIsoWeekDateTzd(regIsoWeekDateTzd("").exec(text),"");
}

/** matches ISO date with a Z (zulu) timezone */
export const REG_ISO_DATE_ZULU = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})Z/i
export function extractIsoDateZulu(match:RegExpMatchArray) {
    if (match) {
        return { year: parseInt(match.groups.year),
            month: parseInt(match.groups.month),
            day: parseInt(match.groups.day),
            timezoneOffset: 0,
            hour: 12    // same default as Chrono
        }
    }
    return {}
}
export function parseIsoDateZulu(text:string) {
    return extractIsoDateZulu(REG_ISO_DATE_ZULU.exec(text))
}


  
export function parseOrdinalNumberPattern(ordinals:{[k:string]:number},match: string, collator:Intl.Collator): number {
    return findInDict(ordinals, match, NaN, [collator])
  }