// ONLY modules AND type.ts DEPEDANCIES

import { DictionaryLike } from "../types";
import { extractEntries, extractTerms } from "./tools";

/** returns the source of a RegExp */
export function regSrc(reg:RegExp):string {
  const str = reg.toString()
  return str.slice(1, str.lastIndexOf("/"))
}

export type Cardinality = "" | "?" | "*" | "+"
export type RegOptions = {name?:string, capture?:boolean, flags?:string, optional?:boolean, cardinality?:Cardinality}

/** an alternative */
export function alt(options:RegOptions, ...reg:RegExp[]):RegExp {
  const prefix = options.name 
    ? `(?<${options.name}>` 
    : (options.capture ? "(" : "(?:");
  const newPattern = prefix + reg.map(x => regSrc(x)).join("|") + ")" + (options.cardinality ?? "")
  return new RegExp(newPattern, options.flags || "")
}

export function seq(options:RegOptions, ...reg:RegExp[]):RegExp {
  const prefix = options.name 
    ? `(?<${options.name}>` 
    : (options.capture ? "(" : "(?:");
  const newPattern = prefix + reg.map(x => regSrc(x)).join("") + ")"+ (options.cardinality ?? "")
  return new RegExp(newPattern, options.flags || "")  
}

/** a named capturing */
export function named(name:string, ...reg:RegExp[]) {
  return seq({name}, ...reg)
}
/** a non-capturing sequence */
export function group(...reg:RegExp[]) {
  return seq({}, ...reg)
}
/** an optional (?) non-capturing sequence */
export function opt(...reg:RegExp[]) {
  return seq({cardinality:"?"}, ...reg)
}
/** an one or more (+) non-capturing sequence */
export function oneOrMore(...reg:RegExp[]) {
  return seq({cardinality:"+"}, ...reg)
}
/** an zero or more (*) non-capturing sequence */
export function zeroOrMore(...reg:RegExp[]) {
  return seq({cardinality:"*"}, ...reg)
}

export function matchAnyPattern(dictionary: DictionaryLike, prefix = "", suffix = ""): string {
    const joinedTerms = extractTerms(dictionary)
      .sort((a, b) => b.length - a.length)
      .map(x => prefix + x + suffix)
      .join("|")
      .replace(/\./g, "\\.");
  
    return `(?:${joinedTerms})`;
  }

  export function substituteChar(text:string):string {
    return text.split("").map(car => {
      switch (car[0]) {
        case " " : return "\\s+"
        case "'" : return "[’ ' ʼ]" // U+2019 Right Single Quotation Mark, U+0027 Apostrophe, U+02BC Modifier Letter Apostrophe
        default: return car;
      }

    }).join("")
  }
  
  export function optionalEnd(text:string):string {
    switch (text.length) {
      case 0:  return "";
      case 1: return substituteChar(text) + "?";
      default:
        return "(?:" + substituteChar(text.charAt(0)) + optionalEnd(text.substring(1)) + ")?";
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
  return substituteChar(item.substring(0, len)) + optionalEnd(item.substring(len) )
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

export function compareWithLt<T>(x:T,y:T) {
  return (x < y ? -1 : (x > y) ? 1 : 0)
}

export interface MPPOptions {
  word?:boolean;
  followup?:boolean;
  allowAmbiguous?:boolean;
}


  /** returns an alternative regular expression in a capturing group (#1) which matches any of the items
   * 
   * @param items 
   * @param len the length of the fixed part
   * @param word  if true, assertions are added to check the pattern is preceded and followed by non word chars
   * @param followup if true, add an optional capturing group (#2) preceded by spaces (used to capture extra input)
   * @returns 
   */
  export function matchPartialPattern(items:DictionaryLike, len:number, options:MPPOptions = {}):string {
    
    const allEntries = extractEntries(items);
    if (!options.allowAmbiguous) {
      // check that there are no ambiguities, coming with a common prefix of length len
      const prefixes = allEntries.map(e => [e[0].substring(0,len),e[1]] as [string, unknown])
        .sort((x,y) => compareWithLt(x[0],y[0]));
      for (let i = 0; i < prefixes.length - 1;++i) {
        if ((prefixes[i][0] == prefixes[i+1][0]) && (prefixes[i][1] != prefixes[i+1][1])) {
          const problems = allEntries.filter(x => x[0].startsWith(prefixes[i][0]))
          throw new RangeError(`Cannot create partial pattern. Dictionnary contains `+ 
            `several keys ${problems.map(x => `${x[0]}(${x[1]})`).join(",")} with the prefix <${prefixes[i][0]}>`)
        }
      }
    }
    let pattern = "(" + allEntries.map(x => x[0])
    .sort((a,b) => compare(b.length, a.length)) // sort in reverse order of length
      .map((x) => matchPartialItemPattern(x, len))
      .join("|") + ")";
    pattern = options.word ? "(?<=\\W|^)" + pattern + "(?=\\W)" : pattern;
    // use \W (non word char) rather than \b, which has limitations handling Unicode characters
    if (options.followup) pattern += "(?:\\s+(.*))?"
    return "(" + pattern + ")";
  }
  
  export function matchPartialRegex(items:DictionaryLike, len:number, options:MPPOptions = {}):RegExp {
    return new RegExp(`${matchPartialPattern(items, len, options)}`,"i");
  }

  /** finds the last match of regex in text */
export  function findLastMatch(text:string, regex:RegExp) { 
  if (!regex.flags.includes("g")) {
    regex = new RegExp(regex.source, regex.flags + "g")
  }
  let lastMatch = null; 
  let match; 
  while ((match = regex.exec(text)) !== null) { 
    lastMatch = match; 
    regex.lastIndex = match.index + match.length;
  }
  return lastMatch; 
}
  