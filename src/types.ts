
import { App, EditorSuggestContext, EventRef, PluginManifest, Plugin } from "obsidian";
import dayjs, { Dayjs, isDayjs } from "dayjs";
import { Component, ParsedResult, Parser, ParsingComponents, ReferenceWithTimezone } from "chrono-node";


export type FieldType<T, K extends keyof T> = T[K];

/** a reference to a format, which can be either
 * - a Intl.DateStyle
 * - "iso" for an ISO 8601 date
 * - the name of a user format
 * - a moment.js format string
 */
export type FormatRef = "full" |"long"|"medium"|"short"|"iso"|string;

type IPlugin = InstanceType<typeof Plugin>

export interface IInternationalDatesPlugin extends IPlugin {
  get parser(): INLDParser;
  get settings(): InternationalDateSettings;

  // #region IInternationalDatesPlugin.Manipulation of UserDateFormats
  
  findUniqueFormatName(base:string):string;
  
  /** return the default UserDateFormat from settings
   * - if the format settings is the name, return this UserDateFormat
   * - otherwise returns the UsetDateSetting based on the locale
   * - of a default format with the "long" Intl format for the uset locale
   */
  getDefaultUserDateFormat():UserDateFormat;

  /** return the first UserDateFormat matching **filter** */
  findUserDateFormat(filter:(x:UserDateFormat) => boolean):UserDateFormat[];

  /** return the first UserDateFormat matching :
   * - with the exact same locale (with all parts)
   * - starting with <key> (it may have additional specifiers)
   *   Useful to handle Country of Script settings
   * - with the same language (ignoring all other specifiers)
   */
  getFirstUserDateFormatFromLocale(someLocale:string):UserDateFormat;

  /** return the first UsetDateFormat matching flags.
   * Returns
   * - name matching, if .format field is specified
   * - locale matching (exact, same prefix and then only language)
   */
  getFirstUserDateFormatFromFlags(flags:IMarkdownFlags):UserDateFormat;
  // #endregion

  // #region Formating to Markdown -------------------------

  /** generate the Markdown for a DateToDiplay */
  generateMarkdownToInsert(date:MarkdownDateParts, ctrlKey?:boolean, altKey?:boolean, shiftKey?:boolean):string;

  /** formats a DateSuggestion to Markdown */
  suggestionToMarkdown(suggestion:IDateSuggestion):MarkdownDateParts;
  /** formats a Date  */
  dateToMarkdown(dateValue:Date, flags:IMarkdownFlags):MarkdownDateParts;
  // #endregion

  // #region IInternationalDatesPlugin:Formating dates to text  -------------------------

    /** formats a Date to the specific format
   * format can be:
   * - iso/iso8601/8601 for ISO dates
   * - an Intl dateStyle (full/long/medium/short or LLLL/LLL/LL/L)
   * - the name of of a user defined format in the settings
   * - a Moment.js format string
   */
  formatDate(dateValue:Date, formatToUse:FormatRef, locale?:string):FormattedDate;

  /** formats the date with a UserDateFormat. 
   * Uses the locale in the format, or defaults to locale in settings
   */
  formatDateWithUserFormat(userFormat:UserDateFormat, date:Date):string;
  /** formats the date with a UserDateFormat. 
   * Uses the locale in the format, or defaults to locale in settings
   */
  formatTimeWithUserFormat(userFormat:UserDateFormat, date:Date):string;
  // #endregion

  // #region IInternationalDatesPlugin.Settings manipulation -------------------
  validateSettings():void;
  validateAndSaveSettings():void;
  validateAndSaveSettingsSync():void;

  //#endregion

  app: App;
  manifest: PluginManifest;
}

/** a Intl.DateTimeFormatOptions with additional info for management */
export interface UserDateFormat extends Intl.DateTimeFormatOptions {
  name:string;
  desc?:string;
  locale:string;
}

export type DateStyle = FieldType<UserDateFormat, 'dateStyle'> // "full"|"long"|"medium"|"short";
const DATE_STYLE_OPTIONS:Record<DateStyle|"none", string> = { "full": "Full", "long": 'Long',  'medium': 'Medium', 'short': 'Short', "none":'User defined' }

export function isDateStyle(some:any):some is DateStyle {
  return Object.keys(DATE_STYLE_OPTIONS).contains(some)
}

export type IntlYearFormat = FieldType<UserDateFormat, 'year'> // "numeric"|"2-digit"

export type IntlMonthFormat = FieldType<UserDateFormat, 'month'> // "numeric"|"2-digit"|"long"|"short"|"narrow"

export type IntlDayFormat = FieldType<UserDateFormat, 'day'> // "numeric"|"2-digit"

export type IntlWeekDayFormat = FieldType<UserDateFormat, "weekday">


export interface InternationalDateSettings {
  autosuggestToggleLink: boolean;
  autocompleteTriggerPhrase: string;
  isAutosuggestEnabled: boolean;
  
  dateFormats: UserDateFormat[];
  selectedFormat: string;

  //format: string;
  timeFormat: string;
  separator: string;
  locale: ChronoLocale;

  modalToggleTime: boolean;
  modalToggleLink: boolean;
  linkToDailyNotes: boolean;
  modalMomentFormat: string;

  // obsolete
  // weekStart: DayOfWeek;
}

//#region Chrono

/** a Record with all optinal components  of Chrono Date */
export type DateComponents = {[k in Component]? : number }

/** type guard for {@link DateComponents} */
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

/** extract ONLY date components from *arg* */
export function toDateComponents(arg:Dayjs|Date) {
  if (isDayjs(arg)) {
    // month() is 0 based
    return { year: arg.year(), month: arg.month() + 1, day: arg.date()}
  } else if (arg instanceof Date) {
    return { year: arg.getFullYear(), month: arg.getMonth() + 1, day: arg.getDate()}
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

/** relative reference to a day,  */
export enum RELATIVE_REL {
  NEXT = 1,
  PREVIOUS = -1
}

/** reference to a day, relative to the current one */
export enum RELATIVE_DAY {
  OF_PREVIOUS_WEEK,
  OF_CURRENT_WEEK,
  OF_NEXT_WEEK,
  NEXT_OCCURING,
  PREVIOUS_OCCURING,
}

/** a Parser with a name, usefule for debugging */
export interface NamedChronoParser extends Parser {
  name: string;
}

export interface ParsedResultWithLocale extends ParsedResult {
  locale: string;
}

//#endregion

export enum DateDisplay { asDate, asTime, asTimestamp}

/** A dictionnary of names for DateDisplay. Used to localize prefix like time: or date: */
export type DisplayDict = { [key:string]: DateDisplay};


/** some flags which the user can specifiy on suggestion */
export interface IMarkdownFlags {
  /** the format : either a Intl format name, or a Moment.js format string */
  format?:FormatRef;
  /** how to display the result */
  display?:DateDisplay;
  /** the locale to use (override settings) */
  locale?:string;
  /** the user wants a link */
  asLink?:boolean;
  /** the user wants a link */
  useTextAsLinkAlias?:boolean;
  /** true is user wants the a link to target the daily note */
  linkToDailyNotes?:boolean;
  /** the text used to generated the suggestion */
  text?:string;
  /** the prefix of this suggestion */
  prefix?:string;
  /** the suffix of this suggestion */
  suffix?:string;
}

/** a dzte suggestion from a suggester. It needs to be parsed and then formatted */
export interface IDateSuggestion extends IMarkdownFlags {
  /** the menu item */
  label?: string;
  /** a complementary information string for the user */
  hint?: string;
  /** true if suggestion is a flag */
  isFlag?: boolean;
  /** the date value to use */
  value?: Date ;
  /** the date string to parse (used only if value is undefined) */
  valueString?: string ;
}

/** the text parts of a formated date*/
export interface FormattedDate {
  dateValue: Date;
  dateStr:string;
  timeStr:string;
  timestampStr?:string;
}



export interface NLDResult {
  formattedString: string;
  date: Date;
  moment: Dayjs;
}

/** a FromattedDate with additional display flags */
export interface MarkdownDateParts extends FormattedDate, IMarkdownFlags {
  display:DateDisplay;
  asLink: boolean;
  linkToDailyNotes: boolean;
  useTextAsLinkAlias: boolean;
}

/** the interface for all local date Parsers */
export interface INLDParser {
    get locale():string;
    getParsedDate(selectedText: string): Date;
    /** parse all possible date in *text* */
    parseAll(selectedText: string, refDate?:Date):ParsedResult[];
    moment(date:Date):Dayjs;
  }
  
  
/** Add the plugin to the context, to provide access to settings */
export interface NLDSuggestContext extends EditorSuggestContext {
  plugin: IInternationalDatesPlugin;
  last?:IDateSuggestion;
}
  
/** each locale can add its own ISuggestionMakers */
export interface ISuggestionMaker {
    
  /** returns an array of suggestions from context */
  getDateSuggestions(context: NLDSuggestContext): IDateSuggestion[];

  getNoSuggestPreceedingRange():number;
  getNoSuggestPreceedingChars():RegExp;
}

  
export interface INLDSuggestionContext {
  plugin: IInternationalDatesPlugin;
  query: string;
  now: Dayjs;
  ianaTimezone: string;
  locale: string;
}

/** Prototype of function who suggest dates */
export type Suggester = (context:INLDSuggestionContext) => IDateSuggestion[]


