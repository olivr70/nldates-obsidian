import { EditorSuggestContext } from "obsidian";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/de';
import weekday from "dayjs/plugin/weekday";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import { DateDisplay, IDateCompletion, INaturalLanguageDatesPlugin, ISuggestionContext, Suggester } from "../../types";
import { iterateFrom } from "../../utils";
import { DAY_NAMES_DE_INTL, DAY_NAMES_DE_REGEX, MONTH_NAMES_DE_INTL, LOCALES_DE, VARIANTS_DE, REG_VERGANGENE_TAG, DAY_NAME_RELATIVES_DICT, findDayFromStart, POD_PARTIAL3_REGEX, PARTS_OF_DAY_NAMES_DE_DICT } from "./constants-de"
import { SuggestionMakerBase } from "../../suggest/suggestion-maker-base";
import { getIsoWeekSuggestions, SUGGESTERS_COMMON } from "../common/suggestions-common";

dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)


const SUGGESTERS_DE:Suggester[] = [ 
  // common suggesters for all languages
  ...SUGGESTERS_COMMON,
  // local specific suggesters
  getTimeOfDaySuggestions,
  getZeitSuggestions, 
  getLastSuggestions, 
  getDaynamesSuggestions,
  getNextDaynameSuggestions, 
  getNumberSuggestions,
  getCasualSuggestions, 
  getVorSuggestions,
  vergangeneQuery, 
  getInSuggestion, 
  getUbermorgenSuggestions,
]


const DISPLAY_NAMES_DE: { [key:string]: DateDisplay} = {
  time: DateDisplay.asTime,
  zeit: DateDisplay.asTime,
  date: DateDisplay.asDate,
  timestamp: DateDisplay.asTimestamp,
  ts: DateDisplay.asTimestamp,
  zeitstempel: DateDisplay.asTimestamp,
  zs: DateDisplay.asTimestamp,
}


export class SuggestionsMakerDe extends SuggestionMakerBase {

  constructor() {
    super(SUGGESTERS_DE, DISPLAY_NAMES_DE)
  }

    logDebugInfo(loc:string) {
      let currentTz = dayjs.tz.guess(); // guess the timezone
      const vNow = dayjs().toDate()

      console.log(`node ${process.versions.node}`)
      console.log(`Electron ${process.versions.electron}`)
      console.log(`Chromium ${process.versions.chrome}`)
      console.log(VARIANTS_DE)
      console.log(LOCALES_DE)
      for (const l of LOCALES_DE) {
        console.log(l)
        console.log(`DateTimeFormat for ${l}`)
        try {
          const fmt = Intl.DateTimeFormat(l)
          console.log(fmt.format(new Date(2024,2,14)))
          console.log(dayjs("2024-04-14").locale(l).format("LLL"))

        } catch (x) {
          console.log("Fail");
          console.log(x)
        }
      }
      console.log("Timezone")
      console.log(dayjs.tz())
      console.log(`Guessed timezone : ${currentTz}`); // print the timezone
      console.log(`Now : dayjs : ${dayjs()} toDate : ${vNow}`)
      console.log(`Now in ${currentTz} : ${(dayjs()).tz(currentTz, true)}}`)
      console.log(`Now in ${currentTz} : ${(dayjs()).tz(currentTz, false)}}`)
      console.log(`Now in ${currentTz} : ${(dayjs()).tz(currentTz, false)}}`)
      console.log(`Now local: ${(dayjs()).local()}`)

      const DDAY = "1944-06-06T06:00"
      console.log(`DDay : ${dayjs(DDAY)} toDate() ${dayjs(DDAY).toDate()}`)
      console.log(`DDay using tz() : ${dayjs.tz(DDAY)} toDate() ${dayjs.tz(DDAY).toDate()}`)
      console.log(`DDay then switchng tz(Toronto) : ${dayjs.tz(DDAY).tz("America/Toronto")} toDate() ${dayjs.tz(DDAY).tz("America/Toronto").toDate()}`)
      console.log(`DDay using tz(,Paris) : ${dayjs.tz(DDAY, "Europe/Paris")} toDate() ${dayjs.tz(DDAY, "Europe/Paris").toDate()}`)
      console.log(`DDay using tz(,Toronto) : ${dayjs.tz(DDAY, "America/Toronto")} toDate() ${dayjs.tz(DDAY, "America/Toronto").toDate()}`)
      console.log(`DDay in Toronto : ${dayjs("1944-06-06T06:00").toDate()}`)
      console.log(`Now in Toronto : ${dayjs().tz("America/Toronto", false)}`)
      const firstDayOfWeek = dayjs().locale(loc).localeData().firstDayOfWeek();
      const startOfWeek = dayjs().tz("CET", true).locale(loc).startOf("week");
      console.log(startOfWeek.tz("CET", true))
      console.log(`startOfWeek ${startOfWeek.year()}-${startOfWeek.month()}-${startOfWeek.day()}`)
      console.log(startOfWeek.tz("UTC", true))
      console.log(startOfWeek.tz("GMT", true))
      const startOfPreviousWeek = startOfWeek.subtract(7,"d")
      const startOfNextWeek = startOfWeek.add(7,"d")
      console.log(`Start of week : day ${firstDayOfWeek} ${DAY_NAMES_DE_INTL[firstDayOfWeek]} / date ${startOfWeek}`);
      const offsetInWeek = dayjs().diff(startOfWeek);
      console.log(`1 week before ${startOfPreviousWeek} / ${startOfPreviousWeek.format("L")}`);
      console.log(`1 week after ${startOfNextWeek} /  ${startOfNextWeek.format("L")}`);
    }
}


function getTimeOfDaySuggestions(context: ISuggestionContext) : IDateCompletion[] {
  const match = context.query.match(POD_PARTIAL3_REGEX)
  if (match) {
    const e=  Object.entries(PARTS_OF_DAY_NAMES_DE_DICT);
    return Object.entries(PARTS_OF_DAY_NAMES_DE_DICT).map(x => {
      return { label: x[0], value: x[1] > 0 ? dayjs().hour(x[1]).toDate() : dayjs().toDate(), display:DateDisplay.asTime }
    })
  }
}

function getZeitSuggestions(context: ISuggestionContext): IDateCompletion[] {
  const zeit = context.query.match(/^(?:time:|z(?:e(?:i(?:t)?)?)?:?)(.*)./i);
  if (zeit) {
    const adj = zeit[1];
    console.log(`ZEIT : ${adj}`);
    return ["jetzt", "morgen", "vormittag","mittag", "nachmittag", "abend", "nacht"]
      .filter((item) => item.toLowerCase().contains(adj))
      .map((val) => ({ label: `time:${val}`, display: DateDisplay.asTime }));
  }
}

function getLastSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
    // last days
    const lastStep = context.query.match(/letz(t(en?)?)?\b\s*(.*)/i);
    if (lastStep) {  // letz...
      const targetDay = lastStep[3].toLowerCase();
      const result:IDateCompletion [] = [];
      for (let offset = 1; offset <= 7; ++offset) {
        const d= dayjs().locale(context.locale).subtract(offset, "d");
        result.push({
          label: `Letzte ${DAY_NAMES_DE_INTL[d.day()]} (${d.format("D MMM")})`,
          value: d.toDate()
        })
      }
      return result.filter((items) => items.label.toLowerCase().contains(targetDay));
    }
}

function getDaynamesSuggestions(context: ISuggestionContext): IDateCompletion[] {
      
    // day names
    console.log(`DAY_NAMES_DE_REGEX ${DAY_NAMES_DE_REGEX}`)
    const dayStep = context.query.match(DAY_NAMES_DE_REGEX);
    if (dayStep) {
      const startOfWeek = dayjs().hour(12).minute(0).second(0).millisecond(0).tz(context.ianaTimezone, true).locale(context.locale).startOf("week");
      const target = dayStep[1];
      const dayIndex = findDayFromStart(target);
      const dayName = DAY_NAMES_DE_INTL[dayIndex];
      console.log(`dayIndex ${dayIndex} ${dayName}`)
      const current = startOfWeek.day(dayIndex);
      const next = startOfWeek.add(7, "d").day(dayIndex)
      const previous = startOfWeek.subtract(7, "d").day(dayIndex);
      console.log(`startOfWeek  ${startOfWeek}`)
      console.log(`${dayName} current  ${current}`)
      console.log(`${dayName} next week ${next}`)
      console.log(`${dayName} previous week ${previous}`)
      return [
        { label: `${dayName} dieser Woche (${current.format("D MMM")})`, 
          alias: `${dayName} dieser Woche`,
          value: current.toDate() }
        , { label: `${dayName} der vorherigen Woche (${previous.format("D MMM")})`, 
          alias: `${dayName} der vorherigen Woche`,
          value:previous.toDate()}
        , { label: `${dayName} der nächsten  Woche (${next.format("D MMM")})`, 
          alias: `${dayName} der nächsten Woche`,
          value:next.toDate()}
      ];
    }
}
function getNextDaynameSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
    // relative days : next 7 days
    const nextStep = context.query.match(/(n(?:ä|ae?)ch(?:s(?:t(?:en?)?)?)?)\b\s*(.*)/i);
    // Note  : "vorherigen" (previous) o "Letzte" (last) are not recognised by chrono
    if (nextStep) {
      const currentDay = dayjs().locale(context.locale).day();
      const targetDay = nextStep[2].toLowerCase();
      console.log(`CurrentDay ${currentDay}`)
      
      let result:IDateCompletion [] = [];
      for (let i = 1; i <= 7; ++i ) {
        console.log(`i ${i}`)
        const nextDay = dayjs().locale(context.locale).add(i,"d");
        result.push({
          label: `Nächste ${DAY_NAMES_DE_INTL[nextDay.day()]} (${nextDay.format("D MMM")})`,
          alias: `Nächste ${DAY_NAMES_DE_INTL[nextDay.day()]}`,
          value: nextDay.toDate()
        })
      }
      return result
          .filter((items) => items.label.toLowerCase().contains(targetDay));
    }
}


// like:  12 => 12 Januar/12 Februar...
function getThisSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
    // relative days
    const relativeStep = context.query.match(/(dies(?:en?)?)\b\s*(.*)/i);
    // Note  : "vorherigen" (previous) o "Letzte" (last) are not recognised by chrono
    if (relativeStep) {
      const adj = relativeStep[1].toLowerCase();
      const targetDay = relativeStep[2].toLowerCase();
      const firstDayOfWeek = dayjs().locale(context.locale).localeData().firstDayOfWeek();
      
      console.log(`Local date ${dayjs().locale(context.locale).format("LLL")}`)
      console.log(`Check locale ${dayjs().locale(context.locale).locale()}`)
      console.log(`Target ${targetDay}`)
      console.log(`node version`, process.versions.node)
      for (let i = -10; i <= 10; ++i) {
        console.log(`Day ${i} ${dayjs().locale(context.locale).weekday(i).format("LLLL")}`)
      }
      return Array.from(iterateFrom(DAY_NAMES_DE_INTL, firstDayOfWeek)).map((val,i) => {
        const dayMoment = dayjs().locale(context.locale).weekday(i)
        return (
          { label: `diesen ${val} (${dayMoment.format("D MMM")})`
          , alias: `diesen ${val}`
          , value: dayMoment.toDate() 
        }) })
          .filter((items) => items.label.toLowerCase().contains(targetDay));

    }
}

// like:  12 => 12 Januar/12 Februar...
function getNumberSuggestions(context: ISuggestionContext): IDateCompletion[] {
  const absoluteDate =
    context.query.match(/^(\d+)\.?\s*(\w*)(\s+(.*))?/i);
  if (absoluteDate) {
    const day = parseInt(absoluteDate[1]);
    const monthFilter = absoluteDate[2].toLowerCase();
    const today = new Date();
    const currentDay = today.getDate();
    var currentMonth = today.getMonth();
    const timeOfDay = absoluteDate[4];
    if (currentDay > day){ currentMonth = currentMonth + 1; }
    const monthNames = MONTH_NAMES_DE_INTL;

    return [
      { label: `${day}. ${monthNames[currentMonth]}` },
      { label: `${day}. ${monthNames[(currentMonth + 1) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 2) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 3) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 4) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 5) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 6) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 7) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 8) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 9) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 10) % 12]}` },
      { label: `${day}. ${monthNames[(currentMonth + 11) % 12]}` },
    ].filter((items) => monthFilter == "" || items.label.toLowerCase().contains(monthFilter));
  }
}
function getVorSuggestions(context: ISuggestionContext): IDateCompletion[] {
      
  const relativeDatePast =
  context.query.match(/^vor\s+(\d+)/i) || context.query.match(/^[-](\d+)/i);
  if (relativeDatePast) {
    const timeDelta = parseInt(relativeDatePast[1]) || 1;
    console.log(`relative date past match ${timeDelta} days (${context.query})`)
    return [
      { label: `vor ${timeDelta} Minuten`, value: context.now.subtract(timeDelta, 'm').toDate(), display: DateDisplay.asTime },
      { label: `vor ${timeDelta} Stunden`, value: context.now.subtract(timeDelta, 'h').toDate(), display: DateDisplay.asTime },
      { label: `vor ${timeDelta} Tagen`, value: context.now.subtract(timeDelta, 'd').toDate() },
      { label: `vor ${timeDelta} Wochen`, value: context.now.subtract(timeDelta, 'w').toDate() },
      { label: `vor ${timeDelta} Monaten`, value: context.now.subtract(timeDelta, 'm').toDate() },
      { label: `vor ${timeDelta} Jahren`, value: context.now.subtract(timeDelta, 'y').toDate() },
    ].filter((items) => items.label.toLowerCase().startsWith(context.query));
  }
}
function getCasualSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
  const relDay = 
  context.query.match(/^(heu(?:te?)?|ges(?:t(?:e(?:rn?)?)?)?|mor(?:g(?:en?)?)?|vor(?:g(?:e(?:s(?:t(?:e(?:rn?)?)?)?)?)?)?)\s*(.*)/i);
//const relDay = context.query.match(DAY_NAMES_RELATIVE_DE_PARTIAL_REGEX);
  if (relDay) {
  console.log(`RELDAY ${relDay[0]}`)
  console.log(`Match count : ${relDay.length}`)
  console.log(`Matched text : ${relDay[0]}`)
  const dayKey = Object.keys(DAY_NAME_RELATIVES_DICT).find((x) => x.startsWith(relDay[1].toLocaleLowerCase("de")));
  const dayName = DAY_NAME_RELATIVES_DICT[dayKey];
  console.log(`Day names : ${dayKey} ${dayName}`)
  const timeOfDay = relDay[2];
  console.log(`Time of day : ${timeOfDay}`)
  const hours= timeOfDay.match(/^\s*(?:um\s*)?([0-1][0-9]|2[0-3]|[1-9|0])\b/i);
  if (hours) {
    return [
    { label: `${dayName}`, display: DateDisplay.asDate },
    { label: `${dayName} um ${hours[1]} Uhr`, display: DateDisplay.asTimestamp },
    ];

  } else {
    return [
      { label: `${dayName}`, display: DateDisplay.asDate },
      { label: `${dayName} morgen`, display: DateDisplay.asTimestamp },
      { label: `${dayName} vormittag`, display: DateDisplay.asTimestamp },
      { label: `${dayName} mittag`, display: DateDisplay.asTimestamp },
      { label: `${dayName} nachmittag`, display: DateDisplay.asTimestamp },
      { label: `${dayName} abend`, display: DateDisplay.asTimestamp },
      { label: `${dayName} nacht`, display: DateDisplay.asTimestamp },
    ].filter((x) => x.label.toLowerCase().contains(`${timeOfDay}`));

  }
}
}
function getUbermorgenSuggestions(context: ISuggestionContext): IDateCompletion[] {
  
    
  const ubermorgen =
    context.query.match(/^((?:ü|ue?)b(e(r(m(o(r(g(en?)?)?)?)?)?)?)?)\s*(.*)/i);
  if (ubermorgen) {
    const day = ubermorgen[1];
    const timeOfDay = ubermorgen[ubermorgen.length];
    return [
      { label: `übermorgen`, display: DateDisplay.asDate },
      { label: `übermorgen morgen`, display: DateDisplay.asTimestamp },
      { label: `übermorgen vormittag`, display: DateDisplay.asTimestamp },
      { label: `übermorgen mittag`, display: DateDisplay.asTimestamp },
      { label: `übermorgen nachmittag`, display: DateDisplay.asTimestamp },
      { label: `übermorgen abend`, display: DateDisplay.asTimestamp },
      { label: `übermorgen nacht`, display: DateDisplay.asTimestamp },
    ].filter((x) => x.label.toLowerCase().startsWith(`${day} ${timeOfDay}`));
  }
}

/** like in 2 Minuten/Studen/Tagen...
 * 
 * @param context 
 * @returns 
 */
function getInSuggestion(context: ISuggestionContext): IDateCompletion[] {
  const relativeDate =
  context.query.match(/^in\s+([+-]?\d+)/i) || context.query.match(/^([+]?\d+)/i);
  if (relativeDate) {
    console.log("relative date match : " + context.query)
    const timeDelta = relativeDate[1]
    const timeOffset= parseInt(timeDelta) || 1;
    return [
      { label: `in ${timeDelta} Minuten`, value: context.now.add(timeOffset, 'm').toDate(), display: DateDisplay.asTime },
      { label: `in ${timeDelta} Stunden`, value: context.now.add(timeOffset, 'h').toDate(), display: DateDisplay.asTime },
      { label: `in ${timeDelta} Tagen`, value: context.now.add(timeOffset, 'd').toDate() },
      { label: `in ${timeDelta} Wochen`, value: context.now.add(timeOffset, 'w').toDate() },
      { label: `in ${timeDelta} Monaten`, value: context.now.add(timeOffset, 'M').toDate() },
      { label: `in ${timeDelta} Jahren`, value: context.now.add(timeOffset, 'y').toDate() },
    ].filter((items) => items.label.toLowerCase().startsWith(context.query));
  }
}

function vergangeneQuery(context: ISuggestionContext): IDateCompletion[] {
  const previousStep = context.query.match(REG_VERGANGENE_TAG);
  // Note  : "vorherigen" (previous) o "Letzte" (last) are not recognised by chrono
  if (previousStep) {
    console.log(previousStep)
    console.log(previousStep[1])
    const targetDay = previousStep[2].toLowerCase();
    console.log(`targetday ${targetDay} `)
    
    let result:IDateCompletion [] = [];
    for (let i = 1; i <= 7; ++i ) {
      console.log(`#${i}`)
      const itemDay = dayjs().locale(context.locale).subtract(i,"d");
      result.push({
        label: `vergangene ${DAY_NAMES_DE_INTL[itemDay.day()]} (${itemDay.format("D MMM")})`,
        value: itemDay.toDate()
      })
    }
    console.log(result);
    return result
          .filter((items) => items.label.toLowerCase().contains(targetDay));

  }
    return [];
}
