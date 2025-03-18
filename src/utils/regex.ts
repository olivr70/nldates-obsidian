// ONLY modules AND type.ts DEPEDANCIES

import { error } from "console";
import { DictionaryLike } from "../types";
import { extractEntries, extractTerms, stripDiacritics } from "./tools";
import { isHighSurrogate, isLowSurrogate } from "./unicode";
import { changeCollatorOptions } from "./intl";


/** look-behind reference for a word
 * Matches any non-letter character or ^
 */
export const WORD_START = /(?<=\W|^)/u
/** look-behind reference for a word
 * Matches any non-letter character or $
 */
export const WORD_END = /(?=\W|$)/u

/** returns the source of a RegExp */
export function regSrc(reg:RegExp|string):string {
  if (typeof reg === "string") return reg;
  const str = reg.toString()
  return str.slice(1, str.lastIndexOf("/"))
}

export type Cardinality = "" | "?" | "*" | "+" | "*?" | "+?" | "??"
export type RegOptions = {
  flags?:string,  // RegExp flags (i, g, u)
  // group options
  name?:string,   // group name
  capture?:boolean, // true if is a capturing group
  assertion?:Assertion // add an assertion. Ignored if name or capture are provided
  // cardinality
  optional?:boolean, // true if regexp is optional
  cardinality?:Cardinality // repetition,
  // more options
  word?:boolean,  // only capture full words
  followup?:boolean // add a followup group which grabs the rest of the string
}

export type Assertion = "lookAhead" | "lookBehind" | "negativeLookAhead" | "negativeLookBehind"
function assertionPrefix(assertion:Assertion) {
  switch (assertion) {
    case "lookAhead" : return "(?="
    case "lookBehind" : return "(?<="
    case "negativeLookAhead" : return "(?!"
    case "negativeLookBehind" : return "(?<!"
  }
}

/** type guard for RegExp */
function isRegExp(value: any): value is RegExp { return value instanceof RegExp; }

/** adds missing regexp flags
 * 
 * considers every character a flag, not checking if they are valid RegExp flags
 */
export function orRegexFlags(current:string, more:string):string {
  return more.split("").reduce((v,f) => v.indexOf(f) == -1 ? v+f : v, current)
}

/** merge all the RegExp flags of reg
 * 
 * Note : merging flags may have effects on the matching (ex : the i (case insentive flags))
 */
export function mergeRegexFlags(current:string, reg:RegExp[]) {
  return reg.reduce((v,r) => orRegexFlags(v, orRegexFlags(v, r.flags)), current)
}

/** return a new regex with the *flagsToSet* */
export function setRegexFlags(reg:RegExp, flagsToSet:string) {
  return new RegExp(reg.source, orRegexFlags(reg.flags, flagsToSet))
}

/** returns all occurences or regex */
export function findAllMatches(text: string, regex: RegExp): RegExpExecArray[] {
  const globalRegex = setRegexFlags(regex, "g")
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;

  while ((match = globalRegex.exec(text)) !== null) {
      matches.push(match);
  }

  return matches;
}
/** returns the occurence of reg at pos */
export function findMatchAt(text: string, regex: RegExp, pos:number): RegExpExecArray {
  const globalRegex = setRegexFlags(regex, "g")
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;

  while ((match = globalRegex.exec(text)) !== null) {
      const matchEnd = match.index + match[0].length
      if (match.index <= pos && pos <= matchEnd) {
        return match; // => exit
      }
      if (pos > matchEnd) {
        break; // no need to go any further
      }
  }

  return null;
}


//#region Creating RegExp

/** grabs all the remaining characters */
const FOLLOW_UP_REG = /(?:\s+(.*))?/

function groupPrefix(options:RegOptions) {
  
  const result = options?.name 
    ? `(?<${options.name}>` 
    : (options?.capture 
      ? "(" 
      : (options?.assertion
        ? assertionPrefix(options.assertion)
        : "(?:"));
  return result;
}

/** an alternative 
 * Flags of subitems are merged (i: case insensitive, g: global, u:unicode..)
 * @see {@link orRegexFlags}
*/
export function alt(options:RegOptions | RegExp, ...reg:(RegExp|string)[]):RegExp {
  if (reg.length == 0) {
    throw new RangeError("Cannot create an empty alt")
  }
  if (options instanceof RegExp || typeof options === "string") {
    reg= [ options, ...reg]
    options = {}
  }
  let body = reg.map(x => regSrc(x)).join("|") + ")";
  let newPattern = groupPrefix(options) + body + (options?.cardinality ?? "")
  if (options?.word) {
    newPattern = regSrc(WORD_START) + newPattern + regSrc(WORD_END)
  }  
  if (options?.followup) {
    newPattern = newPattern + regSrc(FOLLOW_UP_REG)
  }  
  const newFlags = mergeRegexFlags(options?.flags|| "", reg.filter(x => isRegExp(x)) as RegExp[])
  let result =  new RegExp(newPattern, newFlags)
  return result;
}

export function seq(options:RegOptions | RegExp, ...reg:(RegExp|string)[]):RegExp {
  if (reg.length == 0) {
    throw new RangeError("Cannot create an empty seq")
  }
  if (options instanceof RegExp || typeof options === "string") {
    reg= [ options, ...reg]
    options = {}
  }
  let body = reg.map(x => regSrc(x)).join("") + ")";
  let newPattern = groupPrefix(options) + body + (options?.cardinality ?? "")
  if (options?.word) {
    newPattern = regSrc(WORD_START) + newPattern + regSrc(WORD_END)
  }  
  if (options?.followup) {
    newPattern = newPattern + regSrc(FOLLOW_UP_REG)
  }  

  const newFlags = mergeRegexFlags(options?.flags|| "", reg.filter(x => isRegExp(x)) as RegExp[])
  let result =  new RegExp(newPattern, newFlags)
  return result;
}

/** a named capturing */
export function named(name:string, ...reg:(RegExp|string)[]) {
  return seq({name}, ...reg)
}
/** a non-capturing sequence */
export function group(...reg:(RegExp|string)[]) {
  return seq({}, ...reg)
}
/** an optional (?) non-capturing sequence */
export function opt(...reg:(RegExp|string)[]) {
  return seq({cardinality:"?"}, ...reg)
}
/** an one or more (+) non-capturing sequence */
export function oneOrMore(...reg:(RegExp|string)[]) {
  return seq({cardinality:"+"}, ...reg)
}
/** an zero or more (*) non-capturing sequence */
export function zeroOrMore(...reg:(RegExp|string)[]) {
  return seq({cardinality:"*"}, ...reg)
}

export function lookAhead(...reg:(RegExp|string)[]) {
   return seq({assertion:"lookAhead"}, ...reg)
}
export function lookBehind(...reg:(RegExp|string)[]) {
   return seq({assertion:"lookBehind"}, ...reg)
}
export function negativeLookAhead(...reg:(RegExp|string)[]) {
   return seq({assertion:"negativeLookAhead"}, ...reg)
}
export function negativeLookBehind(...reg:(RegExp|string)[]) {
   return seq({assertion:"negativeLookBehind"}, ...reg)
}
//#endregion

//#region Creating from dictionnaries
/** returns a string pattern matching one the keys of **dictionnary** 
 * 
 * @return a named group pattern if a group is passed, a non-capturing group otherwise
*/
export function matchAnyPattern(dictionary: DictionaryLike, prefix = "", suffix = "", group:string = undefined): string {
    const joinedTerms = extractTerms(dictionary)
      .sort((a, b) => b.length - a.length)  // sort from longest to shortest
      .map(x => prefix + x + suffix)
      .join("|")
      .replace(/\./g, "\\.");
  
    return `(?${group ? `<${group}>` : ":"}${joinedTerms})`;
  }

  /** substitutes some characters by a RegExp equivalent
   * - SPACE by \s+
   * - single quote by one the three characters usually found
   */
  export function substituteChar(text:string):string {
    // warning : split() works on chars, not codepoints
    // Array.from() invokes the string iterator, which works on codepoints
    return Array.from(text).map(substituteCodepoint).join("")
  }
    /** substitutes some codepoints by a RegExp equivalent
   * - SPACE by \s+
   * - single quote by one the three characters usually found
   */
    export function substituteCodepoints(codepoints:string[]):string[] {
      // warning : split() works on chars, not codepoints
      // Array.from() invokes the string iterator, which works on codepoints
      return codepoints.map(substituteCodepoint)
    }

  /** substitutes some codepoints by a RegExp equivalent
   * Note : singleCodepoint has multiple codepoints, it is returned as provided
   * (special characters inside the string are left untouched)
   * This means that substitudeCodepoint(substitudeCodepoint("\"")) is idempotent.
   * - escape special RegExp characters ( like [, ], ...)
   * - SPACE by \s+
   * - single quote by one the three characters usually found
   */
  export function substituteCodepoint(singleCodepoint:string):string {
    switch (singleCodepoint) {
        case "." : return "\\."
        case "(" : return "\\("
        case ")" : return "\\)"
        case "[" : return "\\["
        case "]" : return "\\]"
        case "?" : return "\\?"
        case "+" : return "\\+"
        case "*" : return "\\*"
        case "\\" : return "\\\\"
        case " " : return "\\s+"
        case "'" : return "[’ ' ʼ]" // U+2019 Right Single Quotation Mark, U+0027 Apostrophe, U+02BC Modifier Letter Apostrophe
        default: return singleCodepoint;
      }
  }
  
  /** creates a Regexp text which makes all characters optional
   * With "abc", the resulting regexp matches nothing, "a", "ab" of "abc"
   */
  export function optionalEnd(text:string):string {
    // WARNING : text.length returns the number of CHARACTERS, not CODEPOINTS
    if (text.length == 0) { return "" }
    
    const firstCodePointLength = isHighSurrogate(text) ? 2 : 1
    if (text.length == firstCodePointLength) {
      return substituteChar(text) + "?";
    } else {
        // WARNING : substring DOES NOT properly handle codepoints
        return "(?:" + substituteChar(text.substring(0,firstCodePointLength)) + optionalEnd(text.substring(firstCodePointLength)) + ")?";
    }
  }

  /** creates a Regexp text which makes all codepoints optional
   * With ["a","b", "c"], the resulting regexp matches nothing, "a", "ab" of "abc"
   */
  export function optionalEndCodepoints(codepoints:string[]):string {
    // WARNING : text.length returns the number of CHARACTERS, not CODEPOINTS
    if (codepoints.length == 0) { return "" }
    
    if (codepoints.length == 1) {
      return substituteCodepoint(codepoints[0]) + "?";
    } else {
        // WARNING : substring DOES NOT properly handle codepoints
        // recursive call
        return "(?:" + substituteCodepoint(codepoints[0]) + optionalEndCodepoints(codepoints.slice(1)) + ")?";
    }
  }
  
  /** Returns a pattern which matches the first [len] characters of items, 
   * and optionnaly the following ones
   * 
   * @param item 
   * @param cpIndex 
   * @returns 
   */
export function matchPartialItemPattern(text:string, cpIndex:number):string {
  const extra = isHighSurrogate(text) ? 1 : 0
  return substituteChar(text.substring(0, cpIndex)) + optionalEnd(text.substring(cpIndex) )
}
  /** Returns a pattern which matches the first [len] characters of items, 
   * and optionnaly the following ones
   * 
   * @param item 
   * @param cpIndex 
   * @returns 
   */
  export function matchPartialItemPatternFromCodepoints(codepoints:string[], cpIndex:number):string {
    return substituteCodepoints(codepoints.slice(0, cpIndex)) + optionalEndCodepoints(codepoints.slice(cpIndex, codepoints.length) )
  }

export function matchPartialItemRegex(item:string, len:number, word:boolean = false, followup = false):RegExp {
  let pattern = matchPartialItemPattern(item, len)
  pattern = word ? "(?<=\\W|^)" + pattern + "(?=\\W)" : pattern;
  if (followup) pattern += "(?:\\s+(.*))?"
  return new RegExp(pattern,"i");
}
//#endregion

//#region Generic utils
export type CompareFunction<T> = (a:T,b:T) => -1|0|1

export function compare<T>(a:T, b:T):-1|0|1 {
  return (a < b ? -1 : (a > b ? 1 : 0))
}

export function compareArrays<T>(a:T[], b:T[], comp:CompareFunction<T>):-1|0|1 {
  const len = Math.min(a?.length ?? 0, b?.length ?? 0)
  for (let i = 0; i < len; ++i) {
    const res = comp(a[i], b[i])
    if (res != 0) return res; // EXIT
  }
  // all common items are the same. THe shortest array comes first.
  return compare(a?.length ?? 0, b?.length ?? 0)
}

export function compareWithLt<T>(x:T,y:T):-1|0|1  {
  return (x < y ? -1 : (x > y) ? 1 : 0)
}

export function compareReverseWithLt<T>(x:T,y:T):-1|0|1  {
  return (x < y ? 1 : (x > y) ? -1 : 0)
}
//#endregion

export interface MPPOptions {
  word?:boolean;
  followup?:boolean;
  allowAmbiguous?:boolean;
}


  /** returns an alternative regular expression in a capturing group (#1) which matches any of the items
   * 
   * WARNING : codepoints are not supported
   * @deprecated prefer {@link matcPartialItem} which provides a better implementation and supports codepoints
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
  
  /** match any items, with optional endings for characters after len
   * 
   * If multiple items have the same beginning of *len* characters, an Exception is thrown 
   *   if the *allowAmbiguous* option is not true
   * 
   * @deprecated because it not support codepoints, and the fixed len is not practical. Use {@link matchPartialItem}
   */
  export function matchPartialRegex(items:DictionaryLike, len:number, options:MPPOptions = {}):RegExp {
    return new RegExp(`${matchPartialPattern(items, len, options)}`,"i");
  }

  /** finds the last match of regex in text 
   * 
   * @returns null if no match
  */
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

/** creates a RegExp which matches any item of the dictionnary, using a PrefixTree */
export function matchAnyItem(locale:string, dictionary: DictionaryLike, options:RegOptions = undefined): RegExp {
  const tree = makePrefixTree(dictionary, new Intl.Collator(locale))
  const innerReg = makeRegexForItemsFromTree({ flags:options?.flags}, tree)
  if (options) {
    return seq(options, innerReg)
  }
  return innerReg
}
/** creates a RegExp which matches any item of the dictionnary, with unambiguous endings being
 * optional
 * 
 * this is a replacement for {@link matchPartialRegex}
 */
export function matchPartialItem(locale:string, dictionary: DictionaryLike, options:RegOptions = undefined): RegExp {
  const tree = makePrefixTree(dictionary, new Intl.Collator(locale))
  const innerReg = makeRegexForPartialItemsFromTree({ flags:options?.flags}, tree)
  if (options) {
    return seq(options, innerReg)
  }
  return innerReg
}


/** generates a Regexp which matches all items from the prefix tree
 */
function makeRegexForItemsFromTree(options:RegOptions, tree:PrefixNode):RegExp {
  // 
  if (tree.next.length == 0) return new RegExp(tree.prefix.map(codepointsToAlternative).join(""))  // END RECURSION
  // options are only for the root
  const followUps =  tree.next.map(x => makeRegexForItemsFromTree({}, x))
  return seq(options,tree.prefix.map(codepointsToAlternative).join(""), alt({}, ...followUps))
}

/** generates a Regexp which partially matches all items from the prefix tree
 */
function makeRegexForPartialItemsFromTree(options:RegOptions, tree:PrefixNode):RegExp {
  // on a final node, if we match the first char, there are no more ambiguities. The remaining characters are optional
  // IMPORTANT : optionaliseDiactriics must be called after matchPartialItemPattern
  let xx = tree.prefix.map(codepointsToAlternative)
  let xxx = xx.join("")
  if (tree.next.length == 0) return new RegExp(matchPartialItemPatternFromCodepoints(tree.prefix.map(codepointsToAlternative), 1))  // END RECURSION
  const followUps =  tree.next.map(x => makeRegexForPartialItemsFromTree({}, x))
  return seq(options, tree.prefix.map(codepointsToAlternative).join(""), alt({}, ...followUps))
}

/** returns the end offset of the common part between *a* and *b*, starting from *offset* */
function commonPart<T>(a:T[], b:T[], offset:number, to:number, comp:(x:T,y:T) => number):number {
  if (a == undefined || b == undefined) return offset;
  const limit = Math.min(to, a.length, b.length)
  for (let i = offset; i < limit; ++i) {
    if (comp(a[i],b[i]) != 0) return i;
  }
  return limit;
}

/** returns the common prefix in a range of items
 * Comparisons are made using a *collator*, not a strict equality
 * This means that 2 codepoints which are different may be considered equal (ex : a and à, a and A)
 * 
 * The resulting prefix will be an array of strings, each containing additional variants of the common character
 */
function commonPrefixForCodepoints(sortedItems:string[][], collator:Intl.Collator, from:number, to:number, offset:number):string[] {
  // result contains the best prefix. prefixTo the end of the prefix
  let result = sortedItems[from].slice(offset);
  let prefixTo = offset + result.length;

  for (let i = from + 1; i < to; i++) {
    prefixTo = commonPart(sortedItems[from], sortedItems[i], offset, prefixTo, (x,y) => collator.compare(x,y))
    if (prefixTo === offset) return [];
    // add new alternate characters to the current prefix
    for (let c = offset; c < prefixTo; ++c) {
      const some = sortedItems[i][c]
      if (result[c - offset].indexOf(some) == -1) {
        // this is a new variant character (Collator.compare() returned 0, but it is not the same)
        result[c - offset] += some
      }
    }
  }
  return result.slice(0, prefixTo- offset)
}

/** transforms a string to a RegExp source, replacing every character by a
 * group if it has diacritics
 * 
 * WARNING : does not work if *text* is alreday a RegExp, as the characters may already
 * be in a group expression
 */
function optionalizeDiacritics(text:string) {
  const stripped = stripDiacritics(text);
  const sourceIterator = text[Symbol.iterator]()
  const strippedIterator = stripped[Symbol.iterator]()
  let sourceC = sourceIterator.next()
  let strippedC = strippedIterator.next()
  let result = []

  while (!sourceC.done && !strippedC.done) {
    if (sourceC.value != strippedC.value) {
      result.push("[" + sourceC.value + strippedC.value + "]")
    } else {
      result.push(sourceC.value)
    }
    sourceC = sourceIterator.next()
    strippedC = strippedIterator.next()

  }
  return result.join("")
}


function pushIfMissing(ioRes:string[], car:string) {
  if (ioRes.indexOf(car) == -1)  {
    ioRes.push(car)
  }
}

//#endregion
//#region Prefix Tree
export interface PrefixNode {
  prefix:string[];  // using codepoints
  next:PrefixNode[];
}

/** builds a prefix tree from a Dictionnary */
export function makePrefixTree(dictionary:DictionaryLike, collator: Intl.Collator):PrefixNode {
  const baseCollator = changeCollatorOptions(collator, undefined, { sensitivity: "base"})
  const sortedItems = extractTerms(dictionary).sort( (x,y) => -baseCollator.compare(x,y) ).map(x => Array.from(x))
  const next = makePrefixTreeInner(sortedItems, baseCollator, 0, sortedItems.length, 0 )
  return { prefix:[], next }
}

/** generates a prefix tree
 */
function makePrefixTreeInner(sortedItems:string[][], collator:Intl.Collator, from:number, to:number, offset:number):PrefixNode[] {
  //console.log(`makePrefixTreeInner ${sortedItems[from].join("")} ${from}/${to} ${offset}`)
  if (from + 1 == to) { // END RECURSION
    const prefix = sortedItems[from].slice(offset)
    return prefix.length != 0 ? [{ prefix, next:[] }] : [] 
  }
  let start = sortedItems[from][offset]
  let subFrom = from
  let subTo = from + 1
  let parts:PrefixNode[] = []
  let found = false
  while (subTo < to) {
    const nextStart = sortedItems[subTo][offset]
    if (collator.compare(nextStart, start) != 0) {
      found = true
      const prefix = commonPrefixForCodepoints(sortedItems, collator, subFrom, subTo, offset)
      const newOffset = offset + prefix.length;
      const next = makePrefixTreeInner(sortedItems, collator, subFrom, subTo, newOffset)
      // const reg = "(?:" + prefixWithDiacrictics + suffixes + ")"
      parts.push({prefix, next})
      subFrom = subTo
      start = nextStart
    }
    subTo++
  }
  if (subFrom < to) {
    const prefix = commonPrefixForCodepoints(sortedItems, collator, subFrom, to, offset)
    if (found || prefix.length != 0) {
      const newOffset = offset + prefix.length;
      const next = makePrefixTreeInner(sortedItems, collator, subFrom, to, newOffset)
      parts.push({prefix, next})
    }
  }
  return parts
}

export function flattenPrefixTree(tree:PrefixNode) {
  return flattenPrefixTreeInner(tree, "", []);

}

function flattenPrefixTreeInner(tree:PrefixNode, current:string, ioResult:string[]) {
  const newPrefix = current + tree.prefix.join("")
  if (tree.next.length == 0) {
    // this is leaf node
    ioResult.push(newPrefix)
  } else {
    for (let n of tree.next) {
      flattenPrefixTreeInner(n, newPrefix, ioResult)
    }
  }
  return ioResult;
}

/** creates a regex character alternative from a multiple codepoints string
 * For each codepoint, it adds its base character to the set
 * Generated by {@link makePrefixTree}
 */
function codepointsToAlternative(alternateCodepoints:string) {
  let result:string[] = []
  for (let cp of alternateCodepoints) {
    pushIfMissing(result, cp)
    pushIfMissing(result, stripDiacritics(cp))
  }
  return result.length > 1 ? "[" + result.join("") + "]" : result.join("");
}

//#endregion
