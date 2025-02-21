import dayjs, { Dayjs, isDayjs } from "dayjs";
import isoWeek from 'dayjs/plugin/isoWeek';
import { RELATIVE_DAY } from "../types";

dayjs.extend(isoWeek);



export function formatWeekIso(year:number, week:number, day:number = undefined) {
    const weekLimit = dayjs(`{year}-01-01`).isoWeeksInYear() + 1
    let result = `${year + Math.floor(week / weekLimit)}-W${(week % weekLimit).toString().padStart(2,"0")}`
    if (day && day > 0 && day < 8) {
        result += `-${day}`
    }
    return result;
}


/** computes the ISO week number for a [date]
 * Returns a [year,week number]
 */
export function getISOWeekNumber(date:Date):[number,number] {
    const tempDate = new Date(date.valueOf());
    // ISO uses Monday as the first day of week
    const dayNumber = (date.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - dayNumber + 3);
    if (tempDate.getFullYear() < date.getFullYear()) {
        // this date belongs to the last week of the previous year
        return getISOWeekNumber(tempDate)
    } else if (tempDate.getFullYear() > date.getFullYear()) {
        // this date belongs to the first week of the following year
        return [date.getFullYear() + 1, 1]
    } else {
        const firstThursday = tempDate.valueOf();
        tempDate.setMonth(0, 1);
        if (tempDate.getDay() !== 4) {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
        }
        return [date.getFullYear(), 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000)];
    }
}



/** 
 * 
 * @param jsDay a target day number (0 = sunday). Returns undefined if out of bounds
 * @param rel the relative relation
 * @param from the origin (current date by default)
 * @returns the date (Dayjs) or undefined
 */
export function computeRelativeDay(jsDay:number, rel:RELATIVE_DAY, from:Dayjs = dayjs()):Dayjs {
    if (isNaN(jsDay) || jsDay < 0 || jsDay > 7) return undefined;
    const startOfWeek = from.startOf('week');
    switch (rel) {
        case RELATIVE_DAY.NEXT_OCCURING :
            // offset from 1 to 7
            
            // on friday (5), next tuesday (2) : 7 + 2 - 5 = 4
            // on monday (1), next tuesday (2) : 7 + 2 - 1 = 8 = 1
            // on monday (1), next monday (1) : 7 + 1 - 1 = 7 
            const nextDay = (from.day() + 1) % 7
            return from.add(1+((7 + jsDay - nextDay) % 7), "d").hour(12)
        case RELATIVE_DAY.PREVIOUS_OCCURING :
            // offset from 7 to 1
            
            // on friday (5), previous tuesday (2) : 5 - 2 = 3
            // on monday (1), previous tuesday (2) : 7 + 1-2 = 6
            // on monday (1), previous monday (1) : 7 + 1 - 1 = 7 
            const previousDay = (7 + from.day() - 1) % 7
            const dbgOffset = 1+((7 + previousDay - jsDay) % 7)
            const dayBefore = from.subtract(1,"d")
            const dayBefore2 = from.subtract(2,"d")
            const debgResult = from.subtract(dbgOffset,"d")
            return from.subtract(1+((7 + previousDay - jsDay) % 7), "d").hour(12)
        case RELATIVE_DAY.OF_NEXT_WEEK :
            return startOfWeek.add(1,"w").day(jsDay).hour(12)
        case RELATIVE_DAY.OF_PREVIOUS_WEEK :
            return startOfWeek.subtract(1,"w").day(jsDay).hour(12)
        case RELATIVE_DAY.OF_CURRENT_WEEK :
            const offset = (6+jsDay) % 7
            let dd = startOfWeek.add(offset, "d")
            return startOfWeek.add((6+jsDay) % 7, "d").hour(12)
    }
    return undefined
}