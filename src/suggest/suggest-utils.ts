
import { DateDisplay, IDateSuggestion, IInternationalDatesPlugin, IMarkdownFlags, InternationalDateSettings } from "../types";
import { alt, compare, compareReverseWithLt, findLastMatch, group, matchPartialItem, matchPartialItemRegex, matchPartialRegex, named, oneOrMore, opt, seq, zeroOrMore } from "../utils/regex";
import { localeIsCompatibleWith, mayBeLocale, NEUTRAL_COLLATOR_LENIENT, REG_ISO, REG_LOCALE } from "../utils/intl";
import { findPartialInDict } from "../utils/months";
import { debug, enterLeave, watch } from "../utils/debug";
import { getAllParsers } from "../parser";
import { ParsedResult } from "chrono-node";

const LOC = "en"

/** how to display */
// warning : ts (Tsonga), ti (Tigrigna), da (Danish) are valid language codes
export const REG_DISPLAY_FORMAT = /\bts\b|times(t(a(mp?)?)?)?|ti(me?)?|d(a(te?)?)?/

export const REG_MOMENT_FORMAT = /\b[-:\sAaDdEeGgHhkLlMmNQSTsWeYyZz]+\b/

export const INTL_DATE_STYLE_NAMES = [  "full", "long","medium", "short" ];

/** type guard for Intl date styles */
export function isIntlDateStyle(some:string) : some is "full" | "long" | "medium" | "short" {
  const res = INTL_DATE_STYLE_NAMES.contains(some)
  return INTL_DATE_STYLE_NAMES.contains(some)
}

export const INTL_DATE_STYLE_DICT: { [key:string] : string } = {
  "full" :"full",
  "long" :"long",
  "medium" :"medium",
  "short" :"short",
  "LLLL" : "full",
  "LLL" : "long",
  "LL" : "medium",
  "L" : "short"
}

const REG_INTL_DATE_FORMAT_NAME = matchPartialItem("en", INTL_DATE_STYLE_DICT, { flags: "i" })




  /** details : format;locale: or locale;format: */
export const REG_SUGGESTION_DETAILS_OLD = 
alt({capture:false},
  seq({capture:false} // locale;format
    , named("locale2",REG_LOCALE)
    , seq({capture:false, cardinality:"?"}
        , /\s*;\s*/
        , alt({}, named("format2",REG_MOMENT_FORMAT), named("display2", REG_DISPLAY_FORMAT)))
  ), seq({capture:false}  // format;locale
    , alt({}, named("format1", REG_MOMENT_FORMAT), named("display1",REG_DISPLAY_FORMAT))
    , seq({capture:false, cardinality:"?"}, /\s*;\s*/, named("locale1",REG_LOCALE)))
)


const REG_SUGGESTION_ITEM = alt({}, 
  REG_LOCALE,
  REG_MOMENT_FORMAT,
  REG_DISPLAY_FORMAT,
  REG_INTL_DATE_FORMAT_NAME,
  REG_ISO,
  /link|daily/
)

/** separator for parts. COMMA (,) not included, because it is used
 * in some long english date formats (like "March 13, 2025")
 */
  export const REG_SUGGESTION_SEP = /\s*[;]\s*/;

  /** details : format;locale: or locale;format: */
  export const REG_SUGGESTION_DETAILS = 
  seq(REG_SUGGESTION_ITEM, zeroOrMore(REG_SUGGESTION_SEP, REG_SUGGESTION_ITEM))

/** parse suggestion details. Looks for
 * - locales
 * - constants, like daily of link
 * - "iso"
 * - "time", "date" of "ts"
 * - if **plugin** is provided, will look for UserDateFormats by exact name or prefix
 * 
 * if string is empty, returns an empty
 */
export function parseSuggestionDetails(text:string, plugin?:IInternationalDatesPlugin):IMarkdownFlags|null {
  return enterLeave("parseSuggestionDetails", () => {
  debug("text=",text)
  if (text.length != 0 && !REG_SUGGESTION_DETAILS.test(text)) {
    return null;
  }
  const parts = text.split(REG_SUGGESTION_SEP)
  const result:IMarkdownFlags = {}
  for (let [index, p] of parts.entries()) {
    console.log(`  part ${index}='${p}'`)
    // ignore empty parts
    if (p.trim().length == 0) continue;
    // always check locale first
    if (mayBeLocale(p) && !result.locale) { result.locale =p; continue }
    if (/link?/i.test(p)) { result.linkToDailyNotes = true; continue;}  // always link to daily note
    if (/^d(ai|ia)(ly?)?$/i.test(p)) { result.linkToDailyNotes = true; continue;}
    if (REG_ISO.test(p)) { result.format = "iso"; continue; }
    if (REG_DISPLAY_FORMAT.test(p) && result.display == undefined) { result.display = hintToDisplay(p); continue; }
    if (REG_INTL_DATE_FORMAT_NAME.test(p)) { 
      result.format = findPartialInDict(INTL_DATE_STYLE_DICT, p, undefined, [NEUTRAL_COLLATOR_LENIENT])  || result.format
      continue;
    }
    if (/L{1,4}/.test(p)) {
      result.format = INTL_DATE_STYLE_DICT[p];
      continue
    }
    if (plugin) {
      // look for user format name, first exactly (ignoring case), then as a prefix
      let userFormats = plugin.findUserDateFormat(x => x.name.toLowerCase() == p.toLowerCase());
      if (userFormats.length == 0) {
        userFormats = plugin.findUserDateFormat(x => x.name.toLowerCase().startsWith(p.toLowerCase()))
      }
      if (userFormats.length != 0) {
        result.format = userFormats[0].name;
        continue;
      }
    }
    if (isMomentFormat(p)) { 
      result.format = p || result.format
      continue
    }
    console.log(`WARNING : unsupported detail par ${p}`)
  }
  // OK to return an empty object (this is the case when input text is empty)
  return result;
})
}

function logSuggestionDetails(name:string,flags:IMarkdownFlags) {
  if (!flags) { debug(`${name} is null`); return; }
  debug(`- ${name}.locale: ${flags.locale}`)
  debug(`- ${name}.format: ${flags.format}`)
  debug(`- ${name}.display: ${flags.display}`)
  debug(`- ${name}.asLink: ${flags.asLink}`)
  debug(`- ${name}.linkToDailyNotes: ${flags.linkToDailyNotes}`)
}

/** prefix : format;locale: or locale;format: */
export const REG_SUGGESTION_PREFIX = seq({capture:false},
    REG_SUGGESTION_DETAILS,
    /\s*:(?<more>.*)/
  )

/** analyse the prefix parts of a suggestion key 
 * - if ; is used a separator, the text is the last part, 
 * - is no ; is found, the function looks for the first : (COLON) a the marker of the text
*/
export function parseSuggestionPrefix(info:ReturnType<typeof parseSuggestionDetails>, plugin?:IInternationalDatesPlugin):ReturnType<typeof parseSuggestionDetails> {
  return enterLeave("parseSuggestionPrefix", () => {
    let text = info.text
    let sep = text.indexOf(":")
    if (sep == -1) {
      const lastSep:RegExpExecArray = findLastMatch(text, /[;]/)
      sep = lastSep?.index ?? -1
    }
  if (sep != -1) {
    const prefix = text.substring(0,sep)
    const details = parseSuggestionDetails(prefix, plugin)
    logSuggestionDetails("prefix", details)
    if (details) {
      return { ...info, ...details, text: text.substring(sep + 1), prefix }
    }
  }
  return info
})
}

export function parseSuggestionSuffix(info:ReturnType<typeof parseSuggestionDetails>, plugin?:IInternationalDatesPlugin) {
  return enterLeave("parseSuggestionSuffix", () => {
    let text = info.text
    const suffixPos = text.lastIndexOf("@")
    if (suffixPos != -1) {
      const suffix = text.substring(suffixPos + 1);
      const details = parseSuggestionDetails(suffix, plugin)
      logSuggestionDetails("  details", details)
      if (details) {
        return { ...info, ...details, text: text.substring(0,suffixPos), suffix }
      }
    }
    return info;
  } )
}

/** analyze suggestion and get formating hints 
 * Note : default values for suggestions are not added (@see {@link suggestionWithDefaults})
 * 
 * if **plugin** is provided, will look for UserDateFormats names
*/
export function parseSuggestion(text:string, plugin?:IInternationalDatesPlugin):IDateSuggestion {
  // wanring, suffix must be parsed first
  const details= parseSuggestionPrefix(parseSuggestionSuffix({text}, plugin), plugin);
  // prefix and suffix have been separated
  const value = plugin?.parser.getParsedDate(details.text)
  const suggestion:IDateSuggestion = { ...details, ...(value && {value}) }
  return suggestion;
}




export function hintToDisplay(hint:string, def:DateDisplay = DateDisplay.asDate):DateDisplay {
  if (!hint) return def;
  if (/\bts\b/i.test(hint)) {
    return DateDisplay.asTimestamp
  }
  if (/times(t(a(mp?)?)?)?/i.test(hint)) {
    return DateDisplay.asTimestamp
  }
  if (/ti(me?)?/i.test(hint)) {
    return DateDisplay.asTime
  }
  if (/ti(me?)?/i.test(hint)) {
    return DateDisplay.asDate
  }
  return def;
}

/** true if hint looks like a Moment format */
export function isMomentFormat(hint:string):boolean {
  const res=  REG_MOMENT_FORMAT.test(hint)
  return res;
}


  // --------------- Implementation -----------------------------
  /** completes a DateSuggestions with defautls from plugin settings */
  export function suggestionWithDefaults(suggestion:IDateSuggestion, plugin?:IInternationalDatesPlugin):IDateSuggestion {
    return enterLeave("suggestionWithDefaults(",() => {
      debug("suggestion",suggestion)
      if (plugin === undefined) { return suggestion; }
      const s = plugin.settings;
      const defaults:IDateSuggestion = { 
        asLink: s.autosuggestToggleLink,
        linkToDailyNotes: s.linkToDailyNotes
      }
      if (suggestion.locale) {
        if (!suggestion.format) {
          // select the first format for that locale
          const userFormatName = plugin.findUserDateFormat(f => localeIsCompatibleWith(watch("loc",f.locale), suggestion.locale))[0]?.name;
          if (userFormatName) {
            defaults.format = userFormatName;
          }
        }
      } else {
        // no locale nor format set by user, use default format
        defaults.format = s.selectedFormat
      }
      const result = { ...defaults, ...suggestion}
      if (result.value == undefined) {

      }
      return result
    }) // enterLeave
  }