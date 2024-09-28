
import * as chrono from "chrono-node";
import { Chrono } from "chrono-node";

import { DayOfWeek, DictionaryLike } from "./types";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData)

const daysOfWeek: Omit<DayOfWeek, "locale-default">[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getFormattedDate(date: Date, format: string): string {
  return dayjs(date).format(format);
}

export function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function parseTruthy(flag: string): boolean {
  return ["y", "yes", "1", "t", "true"].indexOf(flag.toLowerCase()) >= 0;
}

export function getWeekNumber(dayOfWeek: Omit<DayOfWeek, "locale-default">): number {
  return daysOfWeek.indexOf(dayOfWeek);
}

export function getLocaleWeekStart(): Omit<DayOfWeek, "locale-default"> {
  // @ts-ignore
  const startOfWeek = dayjs.localeData().firstDayOfWeek();
  return daysOfWeek[startOfWeek];
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

  // removes all diacritics signs
  export function stripDiacritics(str:string):string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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


export function getLocalizedChrono(someLocale:string): Chrono {
  switch (someLocale.substring(0,2)) {
    case "de":
      return new Chrono(chrono.de.createCasualConfiguration(true));
    case "fr":
      return new Chrono(chrono.fr.createCasualConfiguration(true));
    case "ja":
      return new Chrono(chrono.ja.createCasualConfiguration());
    case "nl":
      return new Chrono(chrono.nl.createCasualConfiguration(true));
    case "pt":
      return new Chrono(chrono.pt.createCasualConfiguration(true));
    case "zh":
      return new Chrono(chrono.zh.createCasualConfiguration());
    case "en":
      // default is english
    default:
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      switch (locale) {
        case "en-gb":
          return chrono.en.GB.clone();
        default:
          return chrono.en.casual.clone();
      }
  }
}




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


