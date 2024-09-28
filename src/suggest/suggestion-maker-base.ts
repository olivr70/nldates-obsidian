import { EditorSuggestContext } from "obsidian";
import dayjs from "dayjs";

import { 
    DisplayDict, 
    IDateCompletion, 
    INaturalLanguageDatesPlugin, 
    ISuggestionMaker, 
    ISuggestionContext, 
    Suggester, 
    NLDSuggestContext
} from "../types";
import { findPartialInDict } from "../utils/months";



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
  
      
    getDateSuggestions(context: NLDSuggestContext): IDateCompletion[] {
      const match = context.query.match(/(?:([A-Za-z]+):)?(.*)/i);
      const locale = context.plugin.settings.locale
      let queryText = match ? match[2] : context.query
      let displayFormat = findPartialInDict(locale, this.displayNames, match[1], undefined );
      const result = this.querySuggesters(queryText, context, this.suggesters )
      
      if (Array.isArray(result)) {
        return displayFormat ? result.map( (r) => ({...r,...{display: displayFormat}})) : result;
      }
      // return undefined
    }
  
    getNoSuggestPreceedingRange():number {
        return 1;
    }
    getNoSuggestPreceedingChars():RegExp {
        return /[`a-zA-Z0-9]/;
    }
  
    /** iterates on suggesters, returns the first result (not undefined) */
    protected querySuggesters(queryText:string, context:NLDSuggestContext, suggesters:Suggester[]) {
      let query:ISuggestionContext = {
        plugin: context.plugin,
        query: queryText,
        locale: context.plugin.settings.locale,
        ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        now: dayjs()
      }
      for (let suggester of suggesters ) {
        const result = suggester(query);
        if (Array.isArray(result) && result.length != 0) {
          return result;
        }
      }
    }
  }