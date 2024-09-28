import { DictionaryLike } from "../types";
import { extractTerms } from "../utils";

/** returns the source of a RegExp */
export function regSrc(reg:RegExp):string {
  const str = reg.toString()
  return str.slice(1, str.lastIndexOf("/"))
}

export function matchAnyPattern(dictionary: DictionaryLike, prefix = "", suffix = ""): string {
    const joinedTerms = extractTerms(dictionary)
      .sort((a, b) => b.length - a.length)
      .map(x => prefix + x + suffix)
      .join("|")
      .replace(/\./g, "\\.");
  
    return `(?:${joinedTerms})`;
  }
  
  export function optionalEnd(text:string):string {
    switch (text.length) {
      case 0:  return "";
      case 1: return text + "?";
      default:
        return "(?:" + text.charAt(0) + optionalEnd(text.substring(1)) + ")?";
    }
  }
  
  /** Returns a pattern which matches the first [len] characters of items, 
   * and optionnaly the following ones
   * 
   * @param item 
   * @param len 
   * @returns 
   */
export function matchPartialItemPattern(item:string, len:number):string {
  return item.substring(0, len) + optionalEnd(item.substring(len) )
}

export function matchPartialItemRegex(item:string, len:number, word:boolean = false, followup = false):RegExp {
  let pattern = matchPartialItemPattern(item, len)
  pattern = word ? "(?<=\\W|^)" + pattern + "(?=\\W)" : pattern;
  if (followup) pattern += "(?:\\s+(.*))?"
  return new RegExp(pattern,"i");
}

function compare<T>(a:T, b:T):-1|0|1 {
  return (a < b ? -1 : (a > b ? 1 : 0))
}

  /** returns an alternative regular expression in a capturing group (#1) which matches any of the items
   * 
   * @param items 
   * @param len the length of the fixed part
   * @param word  if true, assertions are added to check the pattern is preceded and followed by non word chars
   * @param followup if true, add an optional capturing group (#2) preceded by spaces (used to capture extra input)
   * @returns 
   */
  export function matchPartialPattern(items:DictionaryLike, len:number, word:boolean = false, followup = false):string {
    let pattern = "(" + extractTerms(items)
    .sort((a,b) => compare(b.length, a.length)) // sort in reverse order of length
      .map((x) => matchPartialItemPattern(x, len))
      .join("|") + ")";
    pattern = word ? "(?<=\\W|^)" + pattern + "(?=\\W)" : pattern;
    // use \W (non word char) rather than \b, which has limitations handling Unicode characters
    if (followup) pattern += "(?:\\s+(.*))?"
    return "(" + pattern + ")";
  }
  
  export function matchPartialRegex(items:DictionaryLike, len:number, word:boolean = false, followup = false):RegExp {
    return new RegExp(`${matchPartialPattern(items, len, word, followup)}`,"i");
  }
  