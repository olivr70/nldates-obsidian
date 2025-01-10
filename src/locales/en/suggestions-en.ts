import { EditorSuggestContext } from "obsidian";
import { DateDisplay, IDateSuggestion, ISuggestionMaker, INLDSuggestionContext, Suggester, IInternationalDatesPlugin } from "../../types";
import { time } from "console";
import { SuggestionMakerBase } from "src/suggest/suggestion-maker-base";
import { DAY_NAME_RELATIVES_DICT, DAY_NAMES_RELATIVE_EN_PARTIAL_REGEX } from "./constants-en";
import { SUGGESTERS_COMMON } from "../common/suggestions-common";


const SUGGESTERS_EN:Suggester[] = [ 
  // common suggesters for all languages
  ...SUGGESTERS_COMMON,
  // locale specific suggester
  timeQuery,
  nextLastThisQuery,
  inQuery,
  defaultSuggestions,
]


const DISPLAY_NAMES_EN: { [key:string]: DateDisplay} = {
  time: DateDisplay.asTime,
  date: DateDisplay.asDate,
  timestamp: DateDisplay.asTimestamp,
  ts: DateDisplay.asTimestamp,
}


export class SuggestionsMakerEn extends SuggestionMakerBase {

  constructor() {
    super(SUGGESTERS_EN, DISPLAY_NAMES_EN)
  }
}



function timeQuery(query:INLDSuggestionContext):IDateSuggestion[] {
  if (query.query.match(/^time/)) {
    return ["now", "+15 minutes", "+1 hour", "-15 minutes", "-1 hour"]
      .map((val) => ({ label: `time:${val}`, display: DateDisplay.asTime}))
      .filter((item) => item.label.toLowerCase().startsWith(query.query));
  }
}
function nextLastThisQuery(context:INLDSuggestionContext):IDateSuggestion[] {
  const match = context.query.match(/(next|last|this)/i)
  if (match) {
    const reference = match[1];
    return [
      "week",
      "month",
      "year",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
      .map((val) => ({ label: `${reference} ${val}` }))
      .filter((items) => items.label.toLowerCase().startsWith(context.query));
  }
}

function inQuery(context:INLDSuggestionContext):IDateSuggestion[] {
  const relativeDate =
    context.query.match(/^in ([+-]?\d{1,3}(?!\d))/i) || context.query.match(/^([+-]?\d{1,2}(?!\d))/i);
  if (relativeDate) {
    const timeDelta = relativeDate[1];
    return [
      { label: `in ${timeDelta} minutes`, disply: DateDisplay.asTime },
      { label: `in ${timeDelta} hours`, disply: DateDisplay.asTime },
      { label: `in ${timeDelta} days` },
      { label: `in ${timeDelta} weeks` },
      { label: `in ${timeDelta} months` },
      { label: `${timeDelta} days ago` },
      { label: `${timeDelta} weeks ago` },
      { label: `${timeDelta} months ago` },
    ].filter((items) => items.label.toLowerCase().startsWith(context.query));
  }
}

function defaultSuggestions(context:INLDSuggestionContext):IDateSuggestion[] {
  const match = context.query.match(DAY_NAMES_RELATIVE_EN_PARTIAL_REGEX)
  if (match) {
    return Object.keys(DAY_NAME_RELATIVES_DICT).map(x => ({ label: x})).filter(
      (items) => items.label.toLowerCase().startsWith(context.query))
  }
}