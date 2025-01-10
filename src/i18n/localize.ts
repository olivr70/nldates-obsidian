
import { Locales, TranslationFunctions } from "./i18n-types";
import { i18nString, i18nObject, baseLocale, isLocale } from "./i18n-util";


let currentuiLocale:Locales = baseLocale
export let LLL: TranslationFunctions = i18nObject(currentuiLocale)
console.log("LLL", LLL)

/** sets the current locale to <newLocale>. Defaults to baseLocale if <newLocale> has no translation */
export function setUiLocale(newLocale:string) {
    console.log(`setuiLocale(${newLocale})`)
    console.log("isLocale", isLocale(newLocale))
    const newSupportedLocale = isLocale(newLocale) ? newLocale : baseLocale
    console.log("newSupportedLocale", newSupportedLocale)
    if (newSupportedLocale != currentuiLocale) {
        console.log(`Will change from locale ${currentuiLocale} to ${newSupportedLocale}`)
        currentuiLocale = newSupportedLocale;
        LLL = i18nObject(currentuiLocale)
        console.log("message Settings Loaded", LLL.notifications.SETTINGS_LOADED())
    }
    console.log(`new locale (${currentuiLocale})`)
}

export function getUiLocale():string {
    return currentuiLocale;
}
