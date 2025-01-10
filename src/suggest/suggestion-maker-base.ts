import { EditorSuggestContext } from "obsidian";
import dayjs from "dayjs";

import { 
    DisplayDict, 
    IDateSuggestion, 
    IInternationalDatesPlugin, 
    ISuggestionMaker, 
    INLDSuggestionContext, 
    Suggester, 
    NLDSuggestContext,
    IMarkdownFlags
} from "../types";
import { findPartialInDict } from "../utils/months";
import { parseSuggestion, parseSuggestionDetails, parseSuggestionPrefix, parseSuggestionSuffix, REG_SUGGESTION_SEP } from "./suggest-utils";
import { getLocalizedLanguageName, langFromLocale, MOST_LANGUAGE_CODES, MOST_LOCALES } from "../utils/intl";
import { enterLeave, debug } from "../utils/debug";



/** Suggested base class for local suggestion makers
 * 
 * Sub-classes just provide a list of Suggester functions, and a mapping of format names
 */
export class SuggestionMakerBase implements ISuggestionMaker {
    readonly displayNames:DisplayDict;
    readonly suggesters: Suggester[];
  
    constructor(suggesters: Suggester[], displayNames:DisplayDict) {
      this.suggesters = suggesters;
      this.displayNames = displayNames;
    }
  
    /** @override */
    getDateSuggestions(context: NLDSuggestContext): IDateSuggestion[] {
      return enterLeave("getDateSuggestions", () => {
        // parse flags
        const rawSuffix = parseSuggestionSuffix({text:context.query}, context.plugin)
        const prefix = parseSuggestionPrefix({text:rawSuffix.text}, context.plugin)
        const value = context.plugin.parser.getParsedDate(prefix.text)
        debug("getDateSuggestions", context.query, context.plugin)
        debug("  rawSuffix=", rawSuffix)
        debug("  prefix=", prefix)
        let result:IDateSuggestion[];
        if (rawSuffix.suffix !== undefined) {
          debug("rawSuffix=", rawSuffix)
          result = this.getSuffixSuggestions(context, prefix, rawSuffix)
          if (result) {
            for (let r of result) {
              // set value to context.last, or defaults to value
              r.value = context.last?.value ?? value
            }
          }
        } else { 
          // the generate suggestions for text
          result = this.querySuggesters(prefix.text, context, this.suggesters )
        }
        if (Array.isArray(result)) {
          // merge flags with each suggestion
          return result;
        }
        // return undefined
      })
    }


    getSuffixSuggestions(context:NLDSuggestContext, prefix:IMarkdownFlags, rawSuffix:IMarkdownFlags): IDateSuggestion[] {
      return enterLeave("getSuffixSuggestions", () => {
        const parts = rawSuffix.suffix?.split(REG_SUGGESTION_SEP).filter(x => x.trim().length != 0)
        const editedSuffixPart = parts.length != 0 ? parts[parts.length - 1] : ""
        // the suffix string without the last part (the one the user is editing)
        const validSuffixString = parts.slice(0, parts.length - 1).join(";")
        const validSuffix = parseSuggestionDetails(validSuffixString, context.plugin)
        const flagsAlreadySet = {...prefix, ...validSuffix }
        let result:IDateSuggestion[];
        // if (!result) {
        //   result = this.getFormatNameSuggestions(context, flagsAlreadySet, editedSuffixPart)
        // }
        // if (!result) {
        //   result = this.getLocaleSuggestions(context, flagsAlreadySet, editedSuffixPart)
        // }
        result = this.getAllFlagsSuggestions(context, flagsAlreadySet, editedSuffixPart)
        return result;
      })
    }

    
    getAllFlagsSuggestions(context:NLDSuggestContext, flags:IMarkdownFlags, part:string) {
      const result:IDateSuggestion[] = []
      if (!flags.format) {
        result.push(...this.getFormatNameSuggestions(context, flags, part))
      }
      if (!flags.locale && !flags.format) {
        result.push(...this.getLocaleSuggestions(context, flags, part))
      }
      if (!flags.format) {
        result.push(...this.getIntlFormatsSuggestions(context, flags, part))
      }
      if (!flags.linkToDailyNotes === undefined) {
        result.push(...this.getFlagsSuggestions(context, flags, part))
      }
      return result;
    }

    getFormatNameSuggestions(context:NLDSuggestContext, flags:IMarkdownFlags, part:string): IDateSuggestion[] {
      return enterLeave("getFormatNameSuggestions", () => {
        if (!flags.format) {
          console.log("getFormatNameSuggestions")
          const formats = context.plugin.findUserDateFormat(f => f.name.toLowerCase().startsWith(part.toLowerCase()))
          console.log("  formats", formats)
          if (formats.length != 0) {
            return formats.map((f):IDateSuggestion => {
              return {
                label: f.name,
                format: f.name,
                hint: f.desc || `format ${f.name}`,
                text: context.last?.text,
                value: context.last?.value,
                isFlag: true
              }
            })
          }
        }
        return []
      })
    }
    
    getLocaleSuggestions(context:NLDSuggestContext, flags:IMarkdownFlags, part:string): IDateSuggestion[] {
      return enterLeave("getLocaleSuggestions", () => {

      if (!flags.locale) {
        debug("part", part)
        debug("last", context.last)
        let codes:string[] = []
        if (part.length == 0) {
          // return the main language codes
          codes = ["ar","de", "en", "es", "fr", "ja", "zh"]
        } else if (part.length >= 3) {
          const [lang, country] = part.toLowerCase().split("-")
          if (MOST_LANGUAGE_CODES.contains(lang)) {
            codes = MOST_LOCALES.filter(x => x.toLowerCase().startsWith(`${lang}-${country}`))
          } else {
            // nothing. This is not a language code
          }
        } else {
          codes = MOST_LANGUAGE_CODES.filter(c => c.toLowerCase().startsWith(part.toLowerCase()))
        }
        console.log("  codes", codes)
        if (codes.length != 0) {
          
          return codes.map((lang):IDateSuggestion => {
            return {
              ...flags,
              suffix: [flags.suffix, lang].join(";"),
              locale: lang,
              label: lang,
              hint: getLocalizedLanguageName(lang, context.plugin.settings.locale || "en"),
              text: context.last?.text,
              isFlag: true
            }
          })
        }
      } else {
        return []
      }
      
    })
    }

    getIntlFormatsSuggestions(context:NLDSuggestContext, flags:IMarkdownFlags, part:string):IDateSuggestion[] {
      return ["short","medium","long", "full"]
        .filter(x => x.startsWith(part.toLowerCase()))
        .map(f => 
      ({ ...flags, format:f, label:f, hint: "Intl format " + f,
        suffix: [flags.suffix, f].join(";"),
        text: context.last?.text,
        isFlag: true})
      )
    }

    
    getFlagsSuggestions(context:NLDSuggestContext, flags:IMarkdownFlags, part:string):IDateSuggestion[] {
      const base:IDateSuggestion = {
        ...flags,
        text: context.last?.text,
        isFlag: true
      }
      const result:IDateSuggestion[] = []
      if ("daily".startsWith(part.toLowerCase())) {
        result.push({ ...base,  label: "daily", hint: "link to daily note", linkToDailyNotes:true})
      }
      return result;
    }
  
    getNoSuggestPreceedingRange():number {
        return 1;
    }
    getNoSuggestPreceedingChars():RegExp {
        return /[`a-zA-Z0-9]/;
    }
  
    /** iterates on suggesters, returns the first result (not undefined) */
    protected querySuggesters(queryText:string, context:NLDSuggestContext, suggesters:Suggester[]) {
      return enterLeave("querySuggesters", () => {
        let query:INLDSuggestionContext = {
          plugin: context.plugin,
          query: queryText,
          locale: context.plugin.settings.locale,
          ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          now: dayjs()
        }
        for (let suggester of suggesters ) {
          const result = suggester(query);
          if (Array.isArray(result) && result.length != 0) {
            debug("suggestion by ", suggester.name)
            return result;
          }
        }
      })
    }
  }