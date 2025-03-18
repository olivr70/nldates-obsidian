/** Get and set a global User Interface locale state
 * 
 */
import debug from "debug";
import { Locales, TranslationFunctions } from "./i18n-types";
import { i18nString as i18nStringGen, i18nObject as i18nObjectGen, baseLocale as baseLocaleGen, isLocale as isLocaleGen } from "./i18n-util";


/** our current locale, set using {@link setUiLocale}
 * @global */
let currentuiLocale:Locales = undefined

/** the current translationFunctions */
export let LLL: TranslationFunctions = i18nObjectGen(currentuiLocale)




/** sets the current locale to <newLocale>. Defaults to "en" if we do not have any translation */
export function setUiLocale(newLocale:string) {
    const newSupportedLocale = isLocaleGen(newLocale) ? newLocale : baseLocaleGen
    if (newSupportedLocale != currentuiLocale) {
        currentuiLocale = newSupportedLocale;
        LLL = i18nObjectGen(currentuiLocale)
    }
}

export function getUiLocale():string {
    return currentuiLocale;
}
