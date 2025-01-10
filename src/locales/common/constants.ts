import { toIsoWeekDay } from "../../utils/days";
import { DateComponents } from "../../types";
import { alt, group, named, opt, regSrc, seq } from "../../utils/regex";

/** A day number in month, between 1 and 31, accepts 01 to 09 */
export const REG_DAY_IN_MONTH = /(?:3[0-1]?|[12][0-9]?|0[1-9]|[4-9])/

// patterns for a year
  // copied from wanasit/chrono/src/locale/de/constants.ts
  /** year on exactly 4 digits */
  export const YEAR_VALUE_4_REG = /(?!0{4}\b)([0-9]{4}\b)/; // exclude four 0
  /** year on 1 to 4 digits, excluding 0,00,000 and 0000 */
  export const YEAR_VALUE_REG = /\b(?!0{1,4}\b)\d{1,4}\b/; // exclude list of 0 (00, 000, 0000)
  /** signed year on 1 to 4 digits, excluding 0,00,000 and 0000 */
  export const SIGNED_YEAR_REG = new RegExp(`([-+])?(${regSrc(YEAR_VALUE_REG)})`,"i");
                // group 1 : optional sign (for BCE et CE)
                // group 2 : year number
export function parseYear(text:string, def:number = new Date().getFullYear()):number {
    return parseInt(text) || def;
}

/** Parse Z, +02, -04:45 */
export function regTzd(idx:string) {
    return named(`tzd${idx}`, alt({},
            named(`zulu${idx}`, /Z/),
            group(named(`tzHour${idx}`, /[-+]\d{2}/), opt(/:?/, named(`tzMinute${idx}`, /\d{2}/)))))
//  return /(?<tzd>(?<zulu>Z)|(?<tzHour>[-+]\d{2}):?(?<tzMinute>\d{2})?)/
}
//                      1      2          3                     4
/** extract timezone offset information, or null if none  */ 
export function extractTzd(match:RegExpMatchArray, idx:string):DateComponents {
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

/** a ISO time (requires hour and minutes) 
 * Parse 10:10, 11:12.234 08:09Z
*/
export function regIsoTime(idx:string):RegExp {
    return group(/(?<!\d)/,
            group(named(`hour${idx}`, /\d{2}/), /:/, named(`minute${idx}`, /\d{2}/)),
            opt(/:/, 
                named(`second${idx}`, /\d{2}/), 
                opt(group(/\./, named(`fractions${idx}`, /\d{1,6}/)))), 
            named(`timeZulu${idx}`, /Z?/))
}

/*
export const REG_ISO_TIME = /(?<!\d)(?:(?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2})(?:.(?<fractions>\d{1,6}))?)?|(?<timeZulu>Z))/
//                                     1              2                   3                   4                         5
//                                     hour           minute             second?            fractions                   Zulu
*/
export function extractIsoTime(match:RegExpMatchArray, idx:string):DateComponents {
    if (match) {
        const hour = parseInt(match.groups[`hour${idx}`])
        const minute = parseInt(match.groups[`minute${idx}`])
        const second = parseInt(match.groups[`second${idx}`])
        const millisecond = parseInt(match.groups[`fractions${idx}`]?.substring(0,3).padEnd(3,"0"))
        const timeZulu = parseInt(match.groups[`timeZulu${idx}`])
        const timezoneOffset = 0
        const result:DateComponents = {        
            ...(hour && { hour }),      
            ...(minute && { minute }),      
            ...(second && { second }),      
            ...(millisecond && { millisecond }),
            ...(timeZulu && { timezoneOffset: 0})
        }
        return result;
    }
    return {}
}
export function parseIsoTime(text:string):DateComponents {
    const dbg = regIsoTime("")
    return extractIsoTime(regIsoTime("").exec(text), "")
}

/** 8 groups */
export function regIsoTimeTzd(idx:string) { 
    return group(regIsoTime(idx), opt(regTzd(idx)))
}
export function extractIsoTimeTzd(match:RegExpMatchArray, idx:string):DateComponents {
    if (match) {
        return {...extractIsoTime(match, idx), ...extractTzd(match, idx) }
    }
    return {}
}
export function parseIsoTimeTzd(text:string):DateComponents {
    return extractIsoTimeTzd(regIsoTimeTzd("").exec(text),"");
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

/**
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

/** Parse 2023-W03-1*/
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
/** Parse 2023-W03-1+01:15 */
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