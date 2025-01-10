// ONLY MODULES DEPENDANCIES

import dayjs from 'dayjs';
import "dayjs/locale/de"
import "dayjs/locale/en"
import "dayjs/locale/es"
import "dayjs/locale/fr"
import "dayjs/locale/it"
import "dayjs/locale/ja"
import "dayjs/locale/pt"
import "dayjs/locale/zh"

/** in ISO, first day of week is monday */
export function toIsoWeekDay(dayInWeekJs:number) {
    return (dayInWeekJs + 6) % 7;
}

/** creates a localised instance of dayjs() with one of the preloaded locales
 * Because dynamic loading of dayjs locales is not supported
 */
export function dayjsWithLocale(some:any, someLocale:string) {
    return dayjs(some).locale(someLocale)
}
