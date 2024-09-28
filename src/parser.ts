
import { 
  
  INLDParser, ChronoLocale
} from "./types";
import NLDParserEn from "./locales/en/parser-en";
import NLDParserDe from "./locales/de/parser-de";
import NLDParserFr from "./locales/fr/parser-fr";


const LOCALE_PARSERS:Record<ChronoLocale,INLDParser> = {
  "de" : new NLDParserDe("de"),
  "en" : new NLDParserEn("en"),
  "fr" : new NLDParserFr("fr"),
  "ja" : new NLDParserEn("en"),
  "nl" : new NLDParserEn("en"),
  "pt" : new NLDParserEn("en"),
  "zh" : new NLDParserEn("en")
}


export function parserFactory(someLocale: ChronoLocale) {
  
  if (someLocale in LOCALE_PARSERS)
    return LOCALE_PARSERS[someLocale];
  return LOCALE_PARSERS["en"];
}

