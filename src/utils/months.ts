// ONLY MODULES OF ../utils DEPENDANCIES

import { NEUTRAL_COLLATOR_LENIENT, startsWithUsingCollator } from "./intl";

/** return the value from a key, using a Collators
 * If multiple collators are passed, they are tried in order. The first result is returned.
 * 
 * For each pass, 
 * if there is an exact match, this value is used
 * If multiple keys share the partial key :
 * - if they have the same value, the common value is returned
 * - otherwise, it is ambiguous and undefined is returned
 * 
 * @param collator If passed a locale, the collator will be lenient. Defaults to a neutral lenient collator
 * 
 * @see {@link startsWithUsingCollator}
 */
export function findInDict<T>(
  someDict:{[k:string]:T}, 
  target: string|undefined, 
  def:T,
  collators:(string | Intl.Collator)[] = [NEUTRAL_COLLATOR_LENIENT]): T {
  if (typeof target != "string") return def;
  let result:[string,T] = undefined
  for (let col of collators) {
    const useCollator = typeof col == "string" ? new Intl.Collator(col, {sensitivity:"base"}) : col;
    result = findRawInDict(someDict,target, useCollator) 
    // only keep the result if it is an exact match
    if (result != undefined ) { return result[1]; }
  }
  return def;
}

/** in <someDict>, looks for a hit with a key for which Collator returns equal
   * If multiple results with different values, returns undefined
   * 
   * @param collator: used to compare
  */
function findRawInDict<T>(someDict:{[k:string]:T}, key: string, collator:Intl.Collator): [string,T] | undefined {
  const target = key
  let val = someDict[target]; // look for exact match
  if (val != undefined) {
    return [target, val]
  }
  // no exact match
  const hits:[string,T][] = Object.entries(someDict).filter(kv => collator.compare(kv[0], key) == 0)
  if (hits.length == 0) {
    return undefined
  } else if (hits.length == 1) {
    return hits[0];
  } else if (hits.length > 1) {
    // if multiple hits, only return the value of first hit
    // if other hits have the same value
    for (let i = 1; i < hits.length; ++i) {
      if (hits[i][1] != hits[0][1]) { 
        // fail. This key is ambiguous
        return undefined
      }
    }
    return hits[0]
  }
  return undefined;
}


/** return the value from a partial key, using a Collators
 * If multiple collators are passed, they are tried in order. The first result is returned.
 * 
 * WARNING : only length preserving collators are supported. Function fails with options :
 * - collation : "compat" "phonetic"
 * - ignorePunctuation: true
 * 
 * For each pass, 
 * if there is an exact match, this value is used
 * If multiple keys share the partial key :
 * - if they have the same value, the common value is returned
 * - otherwise, it is ambiguous and undefined is returned
 * 
 * @param collator The collator must preserve length. If passed a locale, the collator will be lenient. Defaults to a neutral lenient collator
 * @throws RangeError if *collator* does not preserve length
 * @see {@link startsWithUsingCollator}
 */
export function findPartialInDict<T>(
  someDict:{[k:string]:T}, 
  partialTarget: string|undefined, 
  def:T,
  collators:(string | Intl.Collator)[] = [NEUTRAL_COLLATOR_LENIENT]): T {
  if (typeof partialTarget != "string") return def;
  let result:[string,T] = undefined
  for (let col of collators) {
    const useCollator = typeof col == "string" ? new Intl.Collator(col, {sensitivity:"base"}) : col;
    result = findRawPartialInDict(someDict,partialTarget, useCollator) 
    if (result != undefined) { return result[1]; }
  }
  return def;
}


  /** in <someDict>, looks for a hit with a partial key and return the value
   * An exact match is always prefered
   * If multiple results, returns undefined
   * 
   * filter: used to test if each key is a match (by default, invokes String.startWith() which is case-sensitive)
  */
  function findRawPartialInDict<T>(someDict:{[k:string]:T}, partialKey: string, collator:Intl.Collator): [string,T] | undefined {
    const target = partialKey
    let val = someDict[target]; // look for exact match
    if (val != undefined) {
      return [target, val]
    }
    // no exact match
    const hits:[string,T][] = Object.entries(someDict).reduce((h:[string,T] [], kv, i) => { if (startsWithUsingCollator(kv[0],target, collator)) { h.push(kv) } return h;}, [])
    if (hits.length == 0) {
      return undefined
    } else if (hits.length == 1) {
      return hits[0];
    } else if (hits.length > 1) {
      // multiple keys start with the prefix
      // first look for an exact match (same length as partialKey)
      const sameLen = hits.filter((a) => a[0].length == partialKey.length)
      if (sameLen.length == 1) {
        // a sinle item is a match. This is the best result
        return sameLen[0];
      }
      // if multiple hits, only return the value of first hit
      // if other hits have the same value
      for (let i = 1; i < hits.length; ++i) {
        if (hits[i][1] != hits[0][1]) { 
          // fail. This prefix is ambiguous
          return undefined
        }
      }
      return hits[0]
    }
    return undefined;
  }
