import { stripDiacritics } from "../utils";

export function findPartialInDict<T>(locale:string, someDict:{[k:string]:T}, partialKey: string|undefined, def:T): T {
  if (typeof partialKey != "string") return def;
    const lowerKey = partialKey.toLocaleLowerCase(locale)
    let result = findRawPartialInDict(someDict,lowerKey) 
    if (typeof result === "undefined") {
      // new lookup is key has diacritics (very useful for some languages like french)
      const strippedKey = stripDiacritics(lowerKey)
      if (strippedKey != lowerKey) {
        result = findRawPartialInDict(someDict,lowerKey)
      }
    }
    return (typeof result !== "undefined" ? result : def);
  }

  function findRawPartialInDict<T>(someDict:{[k:string]:T}, partialKey: string): T | undefined {
    const target = partialKey
    let val = someDict[target];
    if (val === undefined) {
      const hits:T[] = Object.entries(someDict).reduce((h:T [], kv, i) => { if (kv[0].startsWith(target)) { h.push(kv[1]) } return h;}, [])
      val = hits[0]
      if (hits.length == 1) {
        return val;
      } else if (hits.length > 1) {
        return (hits.slice(1).find(x => x != val) === undefined) ? val : undefined
      }else {
        val = undefined;
      }
    }
    return val;
  }