
import { 
  
  INLDParser, ChronoLocale,
  ParsedResultWithLocale
} from "./types";
import NLDParserEn from "./locales/en/parser-en";
import NLDParserDe from "./locales/de/parser-de";
import NLDParserFr from "./locales/fr/parser-fr";
import NLDParserNl from "./locales/nl/parser-nl";
import NLDParserPt from "./locales/pt/parser-pt";
import { ParsedResult } from "chrono-node";
import { compareParseResult } from "./utils/chrono";


const LOCALE_PARSERS:Record<ChronoLocale,INLDParser> = {
  "de" : new NLDParserDe("de"),
  "en" : new NLDParserEn("en"),
  "fr" : new NLDParserFr("fr"),
  "nl" : new NLDParserNl("nl"),
  "pt" : new NLDParserPt("pt"),
  // -----------  
  "ja" : new NLDParserEn("en"),
  "zh" : new NLDParserEn("en")
}

const PARSING_LOCALES = Object.keys(LOCALE_PARSERS) as Array<keyof typeof  LOCALE_PARSERS>

/** returns the parsers for *locales* for which there is one */
export function getAllParsers(locales:ChronoLocale[] = PARSING_LOCALES) {
  let result:INLDParser[] = []
  for (const l of locales) {
    const parserForLocale = LOCALE_PARSERS[l]
    if (parserForLocale)
      result.push(parserForLocale)
  }
  return result;
}

export function parserFactory(someLocale: ChronoLocale) {
  
  if (someLocale in LOCALE_PARSERS)
    return LOCALE_PARSERS[someLocale];
  return LOCALE_PARSERS["en"];
}

export function getAllDatesAt(text:string, pos:number, locales:ChronoLocale[] = PARSING_LOCALES) {
  return filterOverlappingResults(parseAllFromTextWithLocales(text, locales), pos)
}

/** parse all date from text using multiple locales, returns all the possible ParsedResult 
 * 
 * WARNING : this is a costly function, should only be invoked on user interaction
*/
export function parseAllFromTextWithLocales(text:string, locales:ChronoLocale[] = PARSING_LOCALES, refDate?:Date ):ParsedResultWithLocale[] {
  const allParsers = getAllParsers(locales);
  
  let all:ParsedResultWithLocale[] = []
  // try all parsers => each one returns all the dates found in *text*
  for (let p of Object.values(allParsers)) {
    let moreCandidates = p.parseAll(text, refDate)
    all.push(...moreCandidates.map(r => ({ locale:p.locale, ...r})))
  }
  all.sort(compareParseResult)
  return all;
}

export function filterOverlappingResults(results:ParsedResult[], from:number, to?:number) {
  if (to === undefined) to = from
  return results.filter(x => (x.index <= to) && (x.index + x.text.length >= from))
}

