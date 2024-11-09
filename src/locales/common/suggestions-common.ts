import dayjs from "dayjs";
import isLeapYear from "dayjs/plugin/isLeapYear"
import weekOfYear from "dayjs/plugin/weekOfYear"
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear"
import { IDateCompletion, ISuggestionContext } from "../../types";
import { parseIsoWeekDate } from "./constants";
import { ParsingComponents, ReferenceWithTimezone } from "chrono-node";
import { range } from "../../utils/tools";
import { formatWeekIso } from "../../../src/utils/weeks";

dayjs.extend(isLeapYear)
dayjs.extend(isoWeeksInYear)
dayjs.extend(weekOfYear)


// Common Suggesters
export const SUGGESTERS_COMMON = [
    getIsoWeekSuggestions
]

const ISO_WEEK_PARTIAL = /(?<year>\d{4})-?W(?:(?<week>\d{1,2})?(?<dayGroup>-(?<day>\d)?)?)?/
// Groups                 1                   2                    3



function makeWeekSuggestion(context: ISuggestionContext, year:number, week:number, day?:number):IDateCompletion {
    const alias = formatWeekIso(year, week, day)
    const mondayDate = new ParsingComponents(new ReferenceWithTimezone(), parseIsoWeekDate(alias)).date();
    return {
        label: `${alias} (${context.plugin.parser.getFormattedDate(mondayDate, "dddd LL")})`,
        alias,
        value: mondayDate
    }
}

/** generate suggestions for weeks from 0000-W */
export function getIsoWeekSuggestions(context: ISuggestionContext) : IDateCompletion[] {
    const match = context.query.match(ISO_WEEK_PARTIAL)
    if (match) {
        const year = parseInt(match.groups.year)
        const weekLimit = dayjs(`{year}-01-01`).isoWeeksInYear() + 1
        console.log("year " + year, "# of weeks " + weekLimit)
        if (match.groups.week) {
            const week = parseInt(match.groups.week)
            if (match.groups.dayGroup) {
                // we may have a day
                if (match.groups.day) {
                    return [ makeWeekSuggestion(context, year, week, parseInt(match.groups.day)) ]
                } else { // no day specified
                    const base = formatWeekIso(year, week)
                    return range(1,8).map(d => makeWeekSuggestion(context, year, week, d) )
                }
            } else {
                // suggest following weeks
                return range(week, week + 4).map(x => makeWeekSuggestion(context, year, x))
            }
        } else {
            const currentWeek = dayjs().week();
            return range(currentWeek + 1, currentWeek + 4)
                .map(x => makeWeekSuggestion(context, year, x));
        }
    }
}