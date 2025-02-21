/** Get and set a global User Interface locale state
 * 
 */
import { Locales, TranslationFunctions } from "./i18n-types";
import { i18nString, i18nObject, baseLocale, isLocale } from "./i18n-util";


let currentuiLocale:Locales = baseLocale
export let LLL: TranslationFunctions = i18nObject(currentuiLocale)
console.log("LLL", LLL)

/** sets the current locale to <newLocale>. Defaults to baseLocale if <newLocale> has no translation */
export function setUiLocale(newLocale:string) {
    const newSupportedLocale = isLocale(newLocale) ? newLocale : baseLocale
    if (newSupportedLocale != currentuiLocale) {
        console.log(`Will change from locale ${currentuiLocale} to ${newSupportedLocale}`)
        currentuiLocale = newSupportedLocale;
        LLL = i18nObject(currentuiLocale)
        console.log("message Settings Loaded", LLL.notifications.SETTINGS_LOADED())
    }
}

export function getUiLocale():string {
    return currentuiLocale;
}
