
import { EditorSuggestContext } from "obsidian";
import dayjs, { Dayjs, isDayjs } from "dayjs";
import { Component, ParsingComponents, ReferenceWithTimezone } from "chrono-node";
import { NLDSettings } from "./settings";

export interface INaturalLanguageDatesPlugin {
  get parser(): INLDParser;
  get settings(): NLDSettings;
}

export type DateComponents = {[k in Component]? : number }

export function isDateComponents(arg:any): arg is DateComponents {
  if (arg == null || typeof arg != "object") return false;
  if (!("year" in arg && "month" in arg) && !("hour" in arg)) return false;
  for (let k of ["year","month","day","hour","minute","second","millisecond","timezoneOffset"]) {
    const kType = typeof arg[k];
    if (kType !== "undefined" && kType !== "number")  { return false;}
  }
  return true;
}

export function dateComponentsToDate(arg: DateComponents):Date {
  return new ParsingComponents(new ReferenceWithTimezone(), arg).date()
}

export function toDateComponents(arg:Dayjs|Date) {
  if (isDayjs(arg)) {
    return { year: arg.year(), month: arg.month(), day: arg.daysInMonth()}
  } else if (arg instanceof Date) {
    return { year: arg.getFullYear(), month: arg.getMonth(), day: arg.getDate()}
  }
}

// Source `chrono`:
// https://github.com/wanasit/chrono/blob/47f11da6b656cd5cb61f246e8cca706983208ded/src/utils/pattern.ts#L8
// Copyright (c) 2014, Wanasit Tanakitrungruang
export type DictionaryLike = string[] | { [word: string]: unknown } | Map<string, unknown>;


export enum AllChronoLocales {
  DE = "de",
  EN = "en",
  FR = "fr",
  JA = "ja",
  NL = "nl",
  PT = "pt",
  ZH = "zh",
}
export type ChronoLocale = `${AllChronoLocales}`;

/** reference to a day, relative to the current one */
export enum RELATIVE_DAY {
  OF_NEXT_WEEK,
  OF_PREVIOUS_WEEK,
  NEXT_OCCURING,
  PREVIOUS_OCCURING,
}

export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "locale-default";

export enum DateDisplay { asDate, asTime, asTimestamp}

/** A dictionnary of names for DateDisplay. Used to localize prefix like time: or date: */
export type DisplayDict = { [key:string]: DateDisplay};

export interface IDateCompletion {
  /** the menu item */
  label: string;
  /** the string to parse with Chrono */
  alias?: string;
  /** the date value to use */
  value?: string | Date ;
  /** how to display the result */
  display?: DateDisplay;
}


export interface INLDParser {
    get locale():string;
    getParsedDate(selectedText: string, weekStartPreference: DayOfWeek): Date;
    getFormattedDate(date:Date, format: string):string;
    moment(date:Date):Dayjs;
  }
  

export interface NLDResult {
  formattedString: string;
  date: Date;
  moment: Dayjs;
}
  
/** Add the plugin to the context, to provide access to settings */
export interface NLDSuggestContext extends EditorSuggestContext {
  plugin: INaturalLanguageDatesPlugin;
}
  
export interface ISuggestionMaker {
    
  getDateSuggestions(context: NLDSuggestContext): IDateCompletion[];

  getNoSuggestPreceedingRange():number;
  getNoSuggestPreceedingChars():RegExp;
}

  
export interface ISuggestionContext {
  plugin: INaturalLanguageDatesPlugin;
  query: string;
  now: Dayjs;
  ianaTimezone: string;
  locale: string;
}

/** Prototype of function who suggest dates */
export type Suggester = (context:ISuggestionContext) => IDateCompletion[]
