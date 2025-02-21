// ONLY MODULES OR ./types DEPENDANCIES

import * as chrono from "chrono-node";
import { Chrono } from "chrono-node";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";

import { DictionaryLike } from "../types";
import { debugNotif } from "./osbidian";

dayjs.extend(localeData)


export function removeProperties<T extends Record<string,any>>(ioObject:T, filter:(x:any) => boolean) {
  for (let [k,v] of Object.entries(ioObject)) {
    if (filter(v)) {
      delete ioObject[k]
    }
  }
  return ioObject
}


/** creates a single line string by replacing sequences of CR, LF by a single space */
export function makeSingleLine(text:string) {
  return text ? text.split(/[\n\r]+/).join(" ") : ""
}

// ----------------------- COLLECTION TOOLS --------------------

export function* iterateFrom<T>(items:T[], from:number): Generator<T> {
  for (let i = 0; i < items.length; i++) {
    yield items[(from + i) % items.length];
}
}

export function* iterateFromReverse<T>(items:T[], from:number): Generator<T> {
  for (let i = items.length - 1; i >= 0; i--) {
      yield items[(items.length+from - i) % items.length];
  }
}



export function range(begin:number,end:number,step:number = 1) {
  const result = []
  if (begin < end) {
      for (let i = begin; i < end; i += step) {
          result.push(i)
      }
  } else {
      for (let i = begin; i > end; i -= step) {
          result.push(i)
      }
  }
  return result;
}

export function extractTerms(dictionary: DictionaryLike): string[] {
  let keys: string[];
  if (dictionary instanceof Array) {
    keys = [...dictionary];
  } else if (dictionary instanceof Map) {
    keys = Array.from((dictionary as Map<string, unknown>).keys());
  } else {
    keys = Object.keys(dictionary);
  }

  return keys;
}

export function extractEntries(dictionary: DictionaryLike): [string,unknown][] {
  let entries: [string,unknown][];
  if (dictionary instanceof Array) {
    entries = dictionary.map((x,i) => [x,i]);
  } else if (dictionary instanceof Map) {
    entries = [...(dictionary as Map<string, unknown>).entries()];
  } else {
    entries = Object.keys(dictionary).map(p => [p, dictionary[p]]);
  }

  return entries;
}


  /** Creates a dictionnary from one or more arrays (the key is item, the value is the index)
   * keys are lowercased, and a stripped version is also included
   * If the key is a duplicate key and the value is different, then the entry is set to NaN
   */
export function dictFromArrays(locale:string, ...nameArrays:string[][]):{ [word: string]: number } {
  const result:{ [word: string]: number } = {};

  for (let names of nameArrays) {
    for (const [index, value] of names.entries()) {
      if (value) {
        const unambiguousIndex = value in result && result[value] != index ? NaN : index
        result[value] = unambiguousIndex;
        result[value.toLocaleLowerCase(locale)] = unambiguousIndex;
        result[stripDiacritics(value.toLocaleLowerCase(locale))] = unambiguousIndex;
      }
    }
  }
  return result;
}

// ----------------------- DATE TOOLS --------------------

export function getFormattedDate(date: Date, format: string): string {
  return dayjs(date).format(format);
}

export function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}


export function getLocaleWeekStart(locale:string): number {
  // @ts-ignore
  return getIntlWeekStart(locale);
}

// ----------------------- STRING TOOLS --------------------

export function parseTruthy(flag: string): boolean {
  return ["y", "yes", "1", "t", "true"].indexOf(flag.toLowerCase()) >= 0;
}

// removes all diacritics signs
export function stripDiacritics(str:string):string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}



// ----------------------- CHRONO TOOLS --------------------

export function getLocalizedChrono(someLocale:string): Chrono {
  switch (someLocale.substring(0,2)) {
    case "de":
      return new Chrono(chrono.de.createCasualConfiguration(true));
    case "es":
        return new Chrono(chrono.es.createCasualConfiguration());
    case "fr":
      return new Chrono(chrono.fr.createCasualConfiguration(true));
    case "ja":
      return new Chrono(chrono.ja.createCasualConfiguration());
    case "nl":
      return new Chrono(chrono.nl.createCasualConfiguration(true));
    case "pt":
      return new Chrono(chrono.pt.createCasualConfiguration(true));
    case "ru":
          return new Chrono(chrono.ru.createCasualConfiguration());
    case "zh":
      return new Chrono(chrono.zh.createCasualConfiguration());
    case "en":
      // default is english
      switch (someLocale.toLowerCase()) {
        case "en-gb":
          return chrono.en.GB.clone();
        default:
          return chrono.en.casual.clone();
      }
    default:
      // create a Chrono without any parser not refiners
      // it does nothing. Caller must extend it by adding its own
      return new Chrono({parsers:[],refiners:[]})
  }
}

/** compute a unique name */
export function findUniqueName(candidate:string, isUnique:(name:string) => boolean, max = 100):string {
  if (isUnique(candidate)) return candidate;
  const parts = /^(.*?)(\d+)?$/.exec(candidate)
  const base = parts[1].trim()
  let index = parseInt(parts[2] ?? "1") + 1
  let name:string;
  let triesLeft = max
  do {
    if (triesLeft-- == 0) { throw new Error("Too many tries to find a unique name")}
    name = `${base} ${index}`
    index++;
  } while (!isUnique(name))
  return name;
}







