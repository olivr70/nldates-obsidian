import { EditorSuggestContext } from "obsidian";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/de';
import weekday from "dayjs/plugin/weekday";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import { DateDisplay, IDateCompletion, INaturalLanguageDatesPlugin, ISuggestionContext, ISuggestionMaker, Suggester } from "../../types";
import { iterateFrom } from "../../utils/tools";
import { DAY_NAMES_FR_INTL, DAY_NAMES_FR_REGEX, MONTH_NAMES_FR_INTL, LOCALES_FR, VARIANTS_FR,  DAY_NAME_RELATIVES_DICT, findDayFromStartFr } from "./constants-fr"
import { SuggestionMakerBase } from "src/suggest/suggestion-maker-base";
import { formatWeekIso } from "../../../src/utils/weeks";
import { SUGGESTERS_COMMON } from "../common/suggestions-common";
import { matchPartialItemPattern, regSrc } from "../../utils/regex";
import { ParsingComponents, ReferenceWithTimezone } from "chrono-node";
import { parseIsoWeekDate } from "../common/constants";

import { range } from "../../utils/tools";

dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

const SUGGESTERS_FR:Suggester[] = [ 
  // common suggesters for all languages
  ...SUGGESTERS_COMMON,
  // local specific suggesters
  getTimeSuggestionsFr, 
  getDaynamesSuggestions,
  getNextDaynameSuggestions, 
  getThisSuggestions,
  getNumberSuggestions,
  getCasualSuggestions, 
  getIlyaSuggestions,
  getInSuggestion, 
]

export interface ISuggestionQuery {
  text: string;
  now: Dayjs;
  ianaTimezone: string;
  locale: string;
}

const DISPLAY_NAMES_FR: { [key:string]: DateDisplay} = {
  time: DateDisplay.asTime,
  heure: DateDisplay.asTime,
  date: DateDisplay.asDate,
  timestamp: DateDisplay.asTimestamp,
  ts: DateDisplay.asTimestamp,
  horodatage: DateDisplay.asTimestamp,
  horo: DateDisplay.asTimestamp,
}

export class SuggestionsMakerFr extends SuggestionMakerBase {

  constructor() {
    super(SUGGESTERS_FR, DISPLAY_NAMES_FR)
  }
}



function getTimeSuggestionsFr(context: ISuggestionContext): IDateCompletion[] {
  const zeit = context.query.match(/^(?:time:|h(?:e(?:u(?:re?)?)?)?:?)(.*)./i);
  if (zeit) {
    const adj = zeit[1];
    console.log(`heure : ${adj}`);
    return ["maintenant", "metin", "midi","après-midi", "soirée", "nuit"]
      .filter((item) => item.toLowerCase().contains(adj))
      .map((val) => ({ label: `${val}`,  display: DateDisplay.asTime }));
  }
}


function formatWeekFr(year:number, week:number, day:number = undefined) {
  console.log(`formatWeekFr(${year},${week},${day})`)
  // compute number of weeks in year
  const weekLimit = dayjs(`{year}-01-01`).isoWeeksInYear() + 1
  const currentYear = dayjs().year()
  let result = `semaine ${(week % weekLimit).toString()}`
  const yearOfWeek = year + Math.floor(week / weekLimit);
  if (yearOfWeek != currentYear) {
    result += `de <${yearOfWeek}>`
  }
  if (day !== undefined) {
    result = `${DAY_NAMES_FR_INTL[day]} de la ${result}`
  }
  return result;
}

function makeWeekSuggestionFr(context: ISuggestionContext, year:number, week:number, day?:number):IDateCompletion {
  const alias = formatWeekFr(year, week, day)
  const isoWeek = formatWeekIso(year, week, day)
  console.log("alias", alias, "isoWeek", isoWeek)
  const mondayDate = new ParsingComponents(new ReferenceWithTimezone(), parseIsoWeekDate(isoWeek)).date();
  return {
      label: `${alias} (${context.plugin.parser.getFormattedDate(mondayDate, "dddd LL")})`,
      alias,
      value: mondayDate
  }
}

// only when day name is first
const SUG_DAY_NAME = new RegExp(`(?:^\\s*${regSrc(DAY_NAMES_FR_REGEX)})(?:\\s+de?(?:\\s+la?)?)?(?:\\s*${matchPartialItemPattern("semaine", 3)}\\s+(?<weekRef>\\d+|${matchPartialItemPattern("prochaine",3)}|${matchPartialItemPattern("précédente",3)})?)?`,"i")

function getDaynamesSuggestions(context: ISuggestionContext): IDateCompletion[] {
      
    // day names
    console.log(`SUG_DAY_NAME ${SUG_DAY_NAME}`)
    const dayStep = context.query.match(SUG_DAY_NAME);
    if (dayStep) {
      const weekRef = dayStep.groups["weekRef"];
      console.log(`weekRef = ${weekRef}`)
      console.log(`query = ${context.query}`)
      const startOfWeek = dayjs().hour(12).minute(0).second(0).millisecond(0).tz(context.ianaTimezone, true).locale(context.locale).startOf("week");
      const target = dayStep[1];
      const dayIndex = findDayFromStartFr(target);
      const dayName = DAY_NAMES_FR_INTL[dayIndex];
      console.log(`dayIndex ${dayIndex} ${dayName}`)
      const current = startOfWeek.day(dayIndex);
      const next = startOfWeek.add(7, "d").day(dayIndex)
      const previous = startOfWeek.subtract(7, "d").day(dayIndex);
      console.log(`startOfWeek  ${startOfWeek}`)
      console.log(`${dayName} current  ${current}`)
      console.log(`${dayName} next week ${next}`)
      console.log(`${dayName} previous week ${previous}`)

      let currentWeek = dayjs().week();
      let weekNumbers = range(currentWeek + 1, currentWeek + 4)
      const currentYear = dayjs().year()
      if (weekRef && weekRef.match(/\d+/)) {
        // weekref is a number
        const weekNum = parseInt(weekRef)
        console.log(`weeknum = ${weekNum}`)
        if (weekNum == 5) {
          weekNumbers = [ 5, 50, 51, 52, 53]
        } else if (weekNum <= 4) {
          weekNumbers = [ weekNum, ...range(weekNum*10, weekNum*10 + 9)]
        } else {
          weekNumbers = range(weekNum, weekNum + 4)
        }
      }
      console.log("weekNumbers=",weekNumbers)
      const weekNumbersSuggestions = weekNumbers.map(x => makeWeekSuggestionFr(context, currentYear, x, dayIndex));

      return [
        { label: `${dayName} de cette semaine (${current.format("D MMM")})`, 
          alias: `${dayName} de cette semaine`,
          value: current.toDate() }
        , { label: `${dayName} de la semaine précédente (${previous.format("D MMM")})`, 
          alias: `${dayName} de la semaine précédente`,
          value:previous.toDate()}
        , { label: `${dayName} de la semaine prochaine (${next.format("D MMM")})`, 
          alias: `${dayName} de la semaine prochaine`,
          value:next.toDate()},
          ...weekNumbersSuggestions
      ].filter(x => !weekRef || x.label.contains(weekRef));
    }
}
function getNextDaynameSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
    // relative days : next 7 days
    const nextStep = context.query.match(/(?!le\s+)?(pro(?:c(?:h(?:a(?:in?)?)?)?)?)\b\s*(.*)/i);
    // Note  : "prochain" (next) 
    if (nextStep) {
      const currentDay = dayjs().locale(context.locale).day();
      const targetDay = nextStep[2].toLowerCase();
      console.log(`CurrentDay ${currentDay}`)
      
      let result:IDateCompletion [] = [];
      for (let i = 1; i <= 7; ++i ) {
        console.log(`i ${i}`)
        const nextDay = dayjs().locale(context.locale).add(i,"d");
        result.push({
          label: `prochain ${DAY_NAMES_FR_INTL[nextDay.day()]} (${nextDay.format("D MMM")})`,
          alias: `prochain ${DAY_NAMES_FR_INTL[nextDay.day()]}`,
          value: nextDay.toDate()
        })
      }
      return result
          .filter((items) => items.label.toLowerCase().contains(targetDay));
    }
}


// like:  ce mardi.
function getThisSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
    // relative days
    const relativeStep = context.query.match(/ce\s*(.*)/i);
    // Note  : "ce" non reconnu par chrono
    if (relativeStep) {
      const targetDay = relativeStep[1].toLowerCase();
      const firstDayOfWeek = dayjs().locale(context.locale).localeData().firstDayOfWeek();
      
      console.log(`Local date ${dayjs().locale(context.locale).format("LLL")}`)
      console.log(`Check locale ${dayjs().locale(context.locale).locale()}`)
      console.log(`Target ${targetDay}`)
      console.log(`node version`, process.versions.node)
      for (let i = -10; i <= 10; ++i) {
        console.log(`Day ${i} ${dayjs().locale(context.locale).weekday(i).format("LLLL")}`)
      }
      return Array.from(iterateFrom(DAY_NAMES_FR_INTL, firstDayOfWeek)).map((val,i) => {
        const dayMoment = dayjs().locale(context.locale).weekday(i)
        return (
          { label: `ce ${val} (${dayMoment.format("D MMM")})`
          , value: dayMoment.toDate() 
        }) })
          .filter((items) => items.label.toLowerCase().contains(targetDay));

    }
}

/** like:  12 => 12 janvier /12 février... */ 
function getNumberSuggestions(context: ISuggestionContext): IDateCompletion[] {
  const absoluteDate =
    context.query.match(/^(\d+)\s*(\w*)(?:\s+(.*))?/i);
  if (absoluteDate) {
    const day = parseInt(absoluteDate[1]);
    const monthFilter = absoluteDate[2].toLowerCase();
    const today = new Date();
    const currentDay = today.getDate();
    var currentMonth = today.getMonth();
    const timeOfDay = absoluteDate[3];
    if (currentDay > day){ currentMonth = currentMonth + 1; }
    const monthNames = MONTH_NAMES_FR_INTL;

    return [
      { label: `${day} ${monthNames[currentMonth]}` },
      { label: `${day} ${monthNames[(currentMonth + 1) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 2) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 3) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 4) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 5) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 6) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 7) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 8) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 9) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 10) % 12]}` },
      { label: `${day} ${monthNames[(currentMonth + 11) % 12]}` },
    ].filter((items) => monthFilter == "" || items.label.toLowerCase().contains(monthFilter));
  }
}

/** il y a X  */
function getIlyaSuggestions(context: ISuggestionContext): IDateCompletion[] {
      
  const relativeDatePast =
  context.query.match(/^il(?:\s+(?:y(?:\s+(?:a)?)?)?)?(?:\s+(\d+)?)?/i) || context.query.match(/^[-](\d+)/i);
  if (relativeDatePast) {
    const timeDelta = parseInt(relativeDatePast[1]) || 1;
    console.log(`relative date past match ${timeDelta} days (${context.query})`)
    return [
      { label: `il y a ${timeDelta} minutes`, value: context.now.subtract(timeDelta, 'm').toDate(), display: DateDisplay.asTime },
      { label: `il y a ${timeDelta} heures`, value: context.now.subtract(timeDelta, 'h').toDate(), display: DateDisplay.asTime },
      { label: `il y a ${timeDelta} jours`, value: context.now.subtract(timeDelta, 'd').toDate() },
      { label: `il y a ${timeDelta} semaines`, value: context.now.subtract(timeDelta, 'w').toDate() },
      { label: `il y a ${timeDelta} mois`, value: context.now.subtract(timeDelta, 'm').toDate() },
      { label: `il y a ${timeDelta} années`, value: context.now.subtract(timeDelta, 'y').toDate() },
    ].filter((items) => items.label.toLowerCase().startsWith(context.query));
  }
}


function getCasualSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
  const relDay = 
  context.query.match(/^(au(?:j(?:o(?:u(?:r(?:d(?:'(?:h(?:ui?)?)?)?)?)?)?)?)?|dem(?:a(?:in?)?)?|ap(?:r(?:[eè]s?)?)?(?:-?(?:d(?:e(?:m(?:a(?:in?)?)?)?)?)?)?|h(?:i(?:er?)?)?|ava(?:nt?)?(?:-(?:h(?:i(?:er?)?)?)?)?\s*(.*))/i);
//const relDay = context.query.match(DAY_NAMES_RELATIVE_DE_PARTIAL_REGEX);
  if (relDay) {
    console.log(`RELDAY ${relDay[0]}`)
    console.log(`Match count : ${relDay.length}`)
    console.log(`Matched text : ${relDay[0]}`)
    const dayKey = Object.keys(DAY_NAME_RELATIVES_DICT).find((x) => x.startsWith(relDay[1].toLocaleLowerCase("fr")));
    const dayName = DAY_NAME_RELATIVES_DICT[dayKey];
    console.log(`Day names : ${dayKey} ${dayName}`)
    const timeOfDay = relDay[2];
    if (timeOfDay) {
      console.log(`Time of day : ${timeOfDay}`)
      const hours= timeOfDay.match(/^\s*(?:à\s*)?([0-1][0-9]|2[0-3]|[1-9|0])\b/i);
      if (hours) {
        return [
          { label: `${dayName}`, display: DateDisplay.asDate },
          { label: `${dayName} à ${hours[1]} heures`, display: DateDisplay.asTimestamp },
        ];

      } 
    }
    return [
      { label: `${dayName}`, display: DateDisplay.asDate },
      { label: `${dayName} matin`, display: DateDisplay.asTimestamp },
      { label: `${dayName} vormittag`, display: DateDisplay.asTimestamp },
      { label: `${dayName} midi`, display: DateDisplay.asTimestamp },
      { label: `${dayName} après-midi`, display: DateDisplay.asTimestamp },
      { label: `${dayName} soir`, display: DateDisplay.asTimestamp },
      { label: `${dayName} nuit`, display: DateDisplay.asTimestamp },
    ].filter((x) => x.label.toLowerCase().contains(`${timeOfDay}`));

    }
}

/** like in 2 Minuten/Studen/Tagen...
 * 
 * @param query 
 * @returns 
 */
function getInSuggestion(context: ISuggestionContext): IDateCompletion[] {
  const relativeDate =
  context.query.match(/^dans\s+([+-]?\d+)/i) || context.query.match(/^([+]?\d+)/i);
  if (relativeDate) {
    console.log("relative date match : " + context.query)
    const timeDelta = relativeDate[1]
    const timeOffset= parseInt(timeDelta) || 1;
    return [
      { label: `dans ${timeDelta} minutes`, value: context.now.add(timeOffset, 'm').toDate(), display: DateDisplay.asTime },
      { label: `dans ${timeDelta} heures`, value: context.now.add(timeOffset, 'h').toDate(), display: DateDisplay.asTime },
      { label: `dans ${timeDelta} jours`, value: context.now.add(timeOffset, 'd').toDate() },
      { label: `dans ${timeDelta} semaines`, value: context.now.add(timeOffset, 'w').toDate() },
      { label: `dans ${timeDelta} mois`, value: context.now.add(timeOffset, 'M').toDate() },
      { label: `dans ${timeDelta} années`, value: context.now.add(timeOffset, 'y').toDate() },
    ].filter((items) => items.label.toLowerCase().startsWith(context.query));
  }
}
