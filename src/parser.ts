
import { 
  
  INLDParser, ChronoLocale
} from "./types";
import NLDParserEn from "./locales/en/parser-en";
import NLDParserDe from "./locales/de/parser-de";
import NLDParserFr from "./locales/fr/parser-fr";
import NLDParserNl from "./locales/nl/parser-nl";
import NLDParserPt from "./locales/pt/parser-pt";


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

export function getAllParsers() {
  return LOCALE_PARSERS;
}

export function parserFactory(someLocale: ChronoLocale) {
  
  if (someLocale in LOCALE_PARSERS)
    return LOCALE_PARSERS[someLocale];
  return LOCALE_PARSERS["en"];
}

