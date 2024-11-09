import { toIsoWeekDay } from "../../utils/days";
import { DateComponents } from "../../types";
import { regSrc } from "../../utils/regex";

/** 3 groups */
export const REG_TZD = /(?<tzd>(?<zulu>Z)|(?<tzHour>[-+]\d{2}):?(?<tzMinute>\d{2})?)/
//                      1      2          3                     4
/** extract timezone offset information, or null if none  */ 
export function extractTzd(match:RegExpMatchArray):DateComponents {
    // The Zulu time zone (Z) is equivalent to UTC
    if (match) {
        if (match.groups.tzd) {
            let timezoneOffset = undefined;
            if (match.groups.zulu) {
                timezoneOffset = 0; // default (if Z is present)
            } else {
                timezoneOffset = parseInt(match.groups.tzHour) * 60 
                const minuteOffset = parseInt(match.groups.tzMinute) || 0 ;
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
    return extractTzd(REG_TZD.exec(text))?.timezoneOffset;
}

/** a ISO time (requires hour and minutes) 
 * 5 groups
*/
export const REG_ISO_TIME = /(?<!\d)(?:(?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2})(?:.(?<fractions>\d{1,6}))?)?|(?<timeZulu>Z))/
//                                     1              2                   3                   4                         5
//                                     hour           minute             second?            fractions                   Zulu
export function extractIsoTime(match:RegExpMatchArray):DateComponents {
    if (match) {
        const result:DateComponents = {        }
        if (match.groups.hour) result.hour = parseInt(match.groups.hour)
        if (match.groups.minute) result.minute = parseInt(match.groups.minute)
        if (match.groups.second) result.second = parseInt(match.groups.second)
        if (match.groups.fractions) result.millisecond = parseInt(match.groups.fractions.substring(0,3).padEnd(3,"0"))
        if (match.groups.timeZulu) result.timezoneOffset = 0
        return result;
    }
    return {}
}
export function parseIsoTime(text:string):DateComponents {
    return extractIsoTime(REG_ISO_TIME.exec(text))
}

/** 8 groups */
export const REG_ISO_TIME_TZD = new RegExp(`(?:${regSrc(REG_ISO_TIME)}(?:${regSrc(REG_TZD)})?)`)
export function extractIsoTimeTzd(match:RegExpMatchArray):DateComponents {
    if (match) {
        return {...extractIsoTime(match), ...extractTzd(match) }
    }
    return {}
}
export function parseIsoTimeTzd(text:string):DateComponents {
    return extractIsoTimeTzd(REG_ISO_TIME_TZD.exec(text));
}

/** an extended ISO date, with a sign, and negative years 
 * 3 groups
*/
export const REG_ISO_DATE_ERA = /(?:(?<yearEra>[-+]\d{4,6})(?:-(?<monthEra>\d{2})(?:-(?<dayEra>\d{2}))?)?)/
//                                  1                          2                     3
//                                  year                       month?                day?
export function extractIsoDateEra(match:RegExpMatchArray):DateComponents {
    if (match) {
        let year = parseInt(match.groups.yearEra)
        if (year == 0) year = -1    // special case for year 0000
        const result:DateComponents = { year }
        if (match.groups.monthEra) result.month = parseInt(match.groups.monthEra)
        if (match.groups.dayEra) result.day = parseInt(match.groups.dayEra)
        return result;
    }
    return {}
}
export function parseIsoDateEra(text:string):DateComponents {
    return extractIsoDateEra(REG_ISO_DATE_ERA.exec(text))
}

/** era date with time and timezone offset */
export const REG_ISO_TIMESTAMP_ERA = new RegExp(`${regSrc(REG_ISO_DATE_ERA)}(?:T${regSrc(REG_ISO_TIME_TZD)})`)
export function extractIsoTimestampEra(match:RegExpMatchArray):DateComponents {
    return {...extractIsoDateEra(match), ...extractIsoTimeTzd(match) }
}
export function parseIsoTimestampEra(text:string):DateComponents {
    return extractIsoTimestampEra(REG_ISO_TIMESTAMP_ERA.exec(text));
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

/** 4 groups */
export const REG_ISO_WEEK_DATE = /(?<isoWeek>(?<wYear>[-+]?\d{4})-?W(?<wWeek>0[0-9]|[1-4][0-9]|5[0-3])(?:-(?<wDay>\d(?!\d)))?)/
//                                12                                3                                     4
//                                All                               Week number                           Day number
//                                 Year
//                                                
    // note : (?!\d) because the day number is a single digit (otherwise there would a possible confusion
    // with a negative timezoneOffset)
export function extractIsoWeekDate(match:RegExpMatchArray):DateComponents {
    if (match && match.groups.isoWeek) {
        // ISO weeks always start on a Monday
        const year = parseInt(match.groups.wYear)
        const week = parseInt(match.groups.wWeek)
        const dayRef = match.groups.wDay
        const dayInWeekJs = dayRef !== undefined ? parseInt(dayRef) % 7 : 1 // monday

        return computeDateFromWeek(year, week, dayInWeekJs)
    }
}
export function parseIsoWeekDate(text:string):DateComponents {
    return extractIsoWeekDate(REG_ISO_WEEK_DATE.exec(text))
}


// ------------------------------------------------------------------------

export const REG_ISO_WEEK_DATE_TZD = new RegExp(`${regSrc(REG_ISO_WEEK_DATE)}(?:${regSrc(REG_TZD)})?`);
export function extractIsoWeekDateTzd(match:RegExpMatchArray, groupOffset = 0):DateComponents {
    const result = { ...extractIsoWeekDate(match), ...extractTzd(match) };
    return result;
}
export function parseIsoWeekDateTzd(text:string):DateComponents {
    const dbgReg = REG_ISO_WEEK_DATE_TZD
    return extractIsoWeekDateTzd(REG_ISO_WEEK_DATE_TZD.exec(text));
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