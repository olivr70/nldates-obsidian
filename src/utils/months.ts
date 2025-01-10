// ONLY MODULES OF ../utils DEPENDANCIES

import { stripDiacritics } from "./tools";

/** finds the  */
export function findPartialInDict<T>(
  locale:string, 
  someDict:{[k:string]:T}, 
  partialTarget: string|undefined, 
  def:T): T {
  if (typeof partialTarget != "string") return def;
  const lowerTarget = partialTarget.toLocaleLowerCase(locale)
  let result = findRawPartialInDict(someDict,lowerTarget) 
  if (typeof result === "undefined") {
    // new lookup is key has diacritics (very useful for some languages like french)
    const strippedTarget = stripDiacritics(lowerTarget)
    if (strippedTarget != lowerTarget) {
      const startsWithStripped = 
        (key:string, target:string) => stripDiacritics(key).toLocaleLowerCase(locale).startsWith(strippedTarget);
        // do a new search only if 
      result = findRawPartialInDict(someDict,lowerTarget, startsWithStripped)
    }
  }
  return (typeof result !== "undefined" ? result : def);
}


  /** in <someDict>, looks for a hit with a partial key and return the value
   * An exact match is always prefered
   * If multiple results, returne undefined
   * 
   * filter: used to test if each key is a match (by default, invokes String.startWith)
  */
  function findRawPartialInDict<T>(someDict:{[k:string]:T}, partialKey: string, filter?:(key:string,target:string) => boolean): T | undefined {
    if (!filter) filter = (key,target) => key.startsWith(target)
    const target = partialKey
    let val = someDict[target]; // look for exact match
    if (val === undefined) {
      // no exact match
      const hits:T[] = Object.entries(someDict).reduce((h:T [], kv, i) => { if (filter(kv[0],target)) { h.push(kv[1]) } return h;}, [])
      val = hits[0]
      if (hits.length == 1) {
        return val;
      } else if (hits.length > 1) {
        // if multiple hits, only return the value of first hit
        // if all hits have the same value
        return (hits.slice(1).find(x => x != val) === undefined) ? val : undefined
      }else {
        val = undefined;
      }
    }
    return val;
  }