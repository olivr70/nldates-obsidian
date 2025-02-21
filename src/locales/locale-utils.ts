import { UnicodeScript } from "src/utils/intl";
import { ARABIC_TRANSLITERATORS } from "./ar/ar-utils";


export function getTransliterators(script:UnicodeScript) {
    switch (script) {
        case "arab" : 
            return ARABIC_TRANSLITERATORS;
        default:
            return null;
    }
}