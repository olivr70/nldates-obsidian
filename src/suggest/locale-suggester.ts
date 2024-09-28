
import { SuggestionsMakerEn } from "../locales/en/suggestions-en";
import { SuggestionsMakerDe } from "../locales/de/suggestions-de";
import { IDateCompletion, ISuggestionMaker, NLDSuggestContext } from "src/types";
import { ChronoLocale, INaturalLanguageDatesPlugin } from "src/types";
import { EditorSuggestContext } from "obsidian";
import { SuggestionsMakerFr } from "src/locales/fr/suggestions-fr";


const MAKERS:Record<string,ISuggestionMaker> = {
    "de" : new SuggestionsMakerDe(),
    "en" : new SuggestionsMakerEn(),
    "fr" : new SuggestionsMakerFr(),
    "ja" : new SuggestionsMakerEn(),
    "nl" : new SuggestionsMakerEn(),
    "pt" : new SuggestionsMakerEn(),
    "zh" : new SuggestionsMakerEn()
}

class MultiSuggestionMaker implements ISuggestionMaker {
    private _suggesters: ISuggestionMaker[];
    
    constructor(...suggesters:ISuggestionMaker[]) {
        this._suggesters = suggesters;
    }
    getDateSuggestions(context: NLDSuggestContext): IDateCompletion[] {
        let result = null;
        for (let s of this._suggesters) {
            result = s.getDateSuggestions(context);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }
    getNoSuggestPreceedingRange(): number {
        throw new Error("Method not implemented.");
    }
    getNoSuggestPreceedingChars(): RegExp {
        throw new Error("Method not implemented.");
    }
}


export function getSuggestionMaker(locale: ChronoLocale):ISuggestionMaker {
    if (locale in MAKERS)
        return MAKERS[locale];
    const lang = locale.split("-")[0]
    if (lang in MAKERS)
        return MAKERS[lang];
    // if unsupported language, fall back to english
    return MAKERS["en"];
}
