// ONLY MODULES DEPENDANCIES

/** in ISO, first day of week is monday */
export function toIsoWeekDay(dayInWeekJs:number) {
    return (dayInWeekJs + 6) % 7;
}
