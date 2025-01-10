// ONLY MODULES DEPENDANCIES

import dayjs from "dayjs";

import "dayjs/locale"
import { LLL } from "../i18n/localize";

export interface LocaleInfo {
	locale:string;
	lang:string;
	region?:string;
	script?:string;
	extensions?:string;
}

export const MOST_LANGUAGE_CODES = [
	"aa",
	  "af",
	  "am",
	  "ar",
	  "ay",
	  "az",
	  "be",
	  "bg",
	  "bi",
	  "bn",
	  "bs",
	  "byn",
	  "ca",
	  "ch",
	  "cs",
	  "da",
	  "de",
	  "dv",
	  "dz",
	  "el",
	  "en",
	  "es",
	  "et",
	  "fa",
	  "fan",
	  "ff",
	  "fi",
	  "fj",
	  "fo",
	  "fr",
	  "ga",
	  "gn",
	  "gv",
	  "he",
	  "hi",
	  "hif",
	  "hr",
	  "ht",
	  "hu",
	  "hy",
	  "id",
	  "is",
	  "it",
	  "ja",
	  "ka",
	  "kg",
	  "kk",
	  "kl",
	  "km",
	  "ko",
	  "ku",
	  "kun",
	  "ky",
	  "la",
	  "lb",
	  "ln",
	  "lo",
	  "lt",
	  "lu",
	  "lv",
	  "mg",
	  "mh",
	  "mi",
	  "mk",
	  "mn",
	  "ms",
	  "mt",
	  "my",
	  "na",
	  "nb",
	  "nd",
	  "ne",
	  "nl",
	  "nn",
	  "no",
	  "nr",
	  "nrb",
	  "ny",
	  "pa",
	  "pl",
	  "ps",
	  "pt",
	  "qu",
	  "rar",
	  "rm",
	  "rn",
	  "ro",
	  "rtm",
	  "ru",
	  "rw",
	  "sg",
	  "si",
	  "sk",
	  "sl",
	  "sm",
	  "sn",
	  "so",
	  "sq",
	  "sr",
	  "ss",
	  "ssy",
	  "st",
	  "sv",
	  "sw",
	  "ta",
	  "tg",
	  "th",
	  "ti",
	  "tig",
	  "tk",
	  "tn",
	  "to",
	  "tr",
	  "ts",
	  "uk",
	  "ur",
	  "uz",
	  "ve",
	  "vi",
	  "xh",
	  "zh",
	  "zu"
  ]
  
  export const MOST_LOCALES = [
	"aa-ER",
	  "af-NA",
	  "af-ZA",
	  "am-ET",
	  "ar-AE",
	  "ar-BH",
	  "ar-DJ",
	  "ar-DZ",
	  "ar-EG",
	  "ar-ER",
	  "ar-IL",
	  "ar-IQ",
	  "ar-JO",
	  "ar-KM",
	  "ar-KW",
	  "ar-LB",
	  "ar-LY",
	  "ar-MA",
	  "ar-MR",
	  "ar-OM",
	  "ar-PS",
	  "ar-QA",
	  "ar-SA",
	  "ar-SD",
	  "ar-SO",
	  "ar-SY",
	  "ar-TD",
	  "ar-TN",
	  "ar-YE",
	  "ay-BO",
	  "az-AZ",
	  "be-BY",
	  "bg-BG",
	  "bi-VU",
	  "bn-BD",
	  "bs-BA",
	  "bs-ME",
	  "byn-ER",
	  "ca-AD",
	  "ch-GU",
	  "ch-MP",
	  "cs-CZ",
	  "da-DK",
	  "de-AT",
	  "de-BE",
	  "de-CH",
	  "de-DE",
	  "de-LI",
	  "de-LU",
	  "de-VA",
	  "dv-MV",
	  "dz-BT",
	  "el-CY",
	  "el-GR",
	  "en-AG",
	  "en-AI",
	  "en-AQ",
	  "en-AS",
	  "en-AU",
	  "en-BB",
	  "en-BM",
	  "en-BS",
	  "en-BW",
	  "en-BZ",
	  "en-CA",
	  "en-CC",
	  "en-CK",
	  "en-CM",
	  "en-CW",
	  "en-CX",
	  "en-DM",
	  "en-ER",
	  "en-FJ",
	  "en-FK",
	  "en-FM",
	  "en-GB",
	  "en-GD",
	  "en-GG",
	  "en-GH",
	  "en-GI",
	  "en-GM",
	  "en-GS",
	  "en-GU",
	  "en-GY",
	  "en-HK",
	  "en-HM",
	  "en-IE",
	  "en-IM",
	  "en-IN",
	  "en-IO",
	  "en-JE",
	  "en-JM",
	  "en-KE",
	  "en-KI",
	  "en-KN",
	  "en-KY",
	  "en-LC",
	  "en-LR",
	  "en-LS",
	  "en-MF",
	  "en-MH",
	  "en-MP",
	  "en-MS",
	  "en-MT",
	  "en-MU",
	  "en-MW",
	  "en-NA",
	  "en-NF",
	  "en-NG",
	  "en-NR",
	  "en-NU",
	  "en-NZ",
	  "en-PG",
	  "en-PH",
	  "en-PK",
	  "en-PN",
	  "en-PR",
	  "en-PW",
	  "en-RW",
	  "en-SB",
	  "en-SC",
	  "en-SD",
	  "en-SG",
	  "en-SH",
	  "en-SL",
	  "en-SS",
	  "en-SX",
	  "en-SZ",
	  "en-TC",
	  "en-TK",
	  "en-TO",
	  "en-TT",
	  "en-TV",
	  "en-TZ",
	  "en-UG",
	  "en-UM",
	  "en-US",
	  "en-VC",
	  "en-VG",
	  "en-VI",
	  "en-VU",
	  "en-WS",
	  "en-ZA",
	  "en-ZM",
	  "en-ZW",
	  "es-AR",
	  "es-BO",
	  "es-BZ",
	  "es-CL",
	  "es-CO",
	  "es-CR",
	  "es-CU",
	  "es-DO",
	  "es-EC",
	  "es-EH",
	  "es-ES",
	  "es-GQ",
	  "es-GT",
	  "es-GU",
	  "es-HN",
	  "es-MX",
	  "es-NI",
	  "es-PA",
	  "es-PE",
	  "es-PR",
	  "es-PY",
	  "es-SV",
	  "es-UY",
	  "es-VE",
	  "et-EE",
	  "fa-IR",
	  "fan-GQ",
	  "ff-BF",
	  "ff-GN",
	  "fi-FI",
	  "fj-FJ",
	  "fo-FO",
	  "fr-BE",
	  "fr-BF",
	  "fr-BI",
	  "fr-BJ",
	  "fr-BL",
	  "fr-CA",
	  "fr-CD",
	  "fr-CF",
	  "fr-CG",
	  "fr-CH",
	  "fr-CI",
	  "fr-CM",
	  "fr-DJ",
	  "fr-FR",
	  "fr-GA",
	  "fr-GF",
	  "fr-GG",
	  "fr-GN",
	  "fr-GP",
	  "fr-GQ",
	  "fr-HT",
	  "fr-JE",
	  "fr-KM",
	  "fr-LB",
	  "fr-LU",
	  "fr-MC",
	  "fr-MF",
	  "fr-MG",
	  "fr-ML",
	  "fr-MQ",
	  "fr-NC",
	  "fr-NE",
	  "fr-PF",
	  "fr-PM",
	  "fr-RE",
	  "fr-RW",
	  "fr-SC",
	  "fr-SN",
	  "fr-TD",
	  "fr-TF",
	  "fr-TG",
	  "fr-VA",
	  "fr-VU",
	  "fr-WF",
	  "fr-YT",
	  "ga-IE",
	  "gn-AR",
	  "gn-PY",
	  "gv-IM",
	  "he-IL",
	  "hi-IN",
	  "hif-FJ",
	  "hr-BA",
	  "hr-HR",
	  "hr-ME",
	  "ht-HT",
	  "hu-HU",
	  "hy-AM",
	  "hy-CY",
	  "id-ID",
	  "is-IS",
	  "it-CH",
	  "it-IT",
	  "it-SM",
	  "it-VA",
	  "ja-JP",
	  "ka-GE",
	  "kg-CD",
	  "kk-KZ",
	  "kl-GL",
	  "km-KH",
	  "ko-KP",
	  "ko-KR",
	  "ku-IQ",
	  "kun-ER",
	  "ky-KG",
	  "la-VA",
	  "lb-LU",
	  "ln-CD",
	  "ln-CG",
	  "lo-LA",
	  "lt-LT",
	  "lu-CD",
	  "lv-LV",
	  "mg-MG",
	  "mh-MH",
	  "mi-NZ",
	  "mk-MK",
	  "mn-MN",
	  "ms-BN",
	  "ms-MY",
	  "ms-SG",
	  "mt-MT",
	  "my-MM",
	  "na-NR",
	  "nb-BV",
	  "nb-NO",
	  "nd-ZW",
	  "ne-NP",
	  "nl-AW",
	  "nl-BE",
	  "nl-BQ",
	  "nl-CW",
	  "nl-MF",
	  "nl-NL",
	  "nl-SR",
	  "nl-SX",
	  "nn-BV",
	  "nn-NO",
	  "no-BV",
	  "no-NO",
	  "no-SJ",
	  "nr-ZA",
	  "nrb-ER",
	  "ny-MW",
	  "pa-AW",
	  "pa-CW",
	  "pl-PL",
	  "ps-AF",
	  "pt-AO",
	  "pt-BR",
	  "pt-CV",
	  "pt-GQ",
	  "pt-GW",
	  "pt-MO",
	  "pt-MZ",
	  "pt-PT",
	  "pt-ST",
	  "pt-TL",
	  "qu-BO",
	  "rar-CK",
	  "rm-CH",
	  "rn-BI",
	  "ro-MD",
	  "ro-RO",
	  "rtm-FJ",
	  "ru-AQ",
	  "ru-BY",
	  "ru-KG",
	  "ru-KZ",
	  "ru-RU",
	  "ru-TJ",
	  "ru-TM",
	  "ru-UZ",
	  "rw-RW",
	  "sg-CF",
	  "si-LK",
	  "sk-CZ",
	  "sk-SK",
	  "sl-SI",
	  "sm-AS",
	  "sm-WS",
	  "sn-ZW",
	  "so-SO",
	  "sq-AL",
	  "sq-ME",
	  "sq-XK",
	  "sr-BA",
	  "sr-ME",
	  "sr-RS",
	  "sr-XK",
	  "ss-SZ",
	  "ss-ZA",
	  "ssy-ER",
	  "st-LS",
	  "st-ZA",
	  "sv-AX",
	  "sv-FI",
	  "sv-SE",
	  "sw-CD",
	  "sw-KE",
	  "sw-TZ",
	  "sw-UG",
	  "ta-LK",
	  "ta-SG",
	  "tg-TJ",
	  "th-TH",
	  "ti-ER",
	  "tig-ER",
	  "tk-AF",
	  "tk-TM",
	  "tn-BW",
	  "tn-ZA",
	  "to-TO",
	  "tr-CY",
	  "tr-TR",
	  "ts-ZA",
	  "uk-UA",
	  "ur-PK",
	  "uz-AF",
	  "uz-UZ",
	  "ve-ZA",
	  "vi-VN",
	  "xh-ZA",
	  "zh-CN",
	  "zh-HK",
	  "zh-MO",
	  "zh-SG",
	  "zh-TW",
	  "zu-ZA"
  ]

export const SUPPORTED_LANGUAGE_CODES = Intl.DateTimeFormat.supportedLocalesOf(MOST_LANGUAGE_CODES)
export const SUPPORTED_LOCALES = Intl.DateTimeFormat.supportedLocalesOf(MOST_LOCALES)

/** returns true if <text> may be a locale string
 * - if it starts with a known language code
 * - and if has the propor syntax
 * 
 * It may still be invalid if other parts (country codes, script codes) are not registered
 */
export function mayBeLocale(text:string):boolean {
  if (!text) return false;
  const parts = text.split("-")
  const xx = MOST_LANGUAGE_CODES
  if ((parts[0].length == 2 || parts[0].length == 3) && MOST_LANGUAGE_CODES.includes(parts[0])) {
    return REG_LOCALE.test(text);
  }
  return false;
}

export function langFromLocale(someLocale:string) {
	return someLocale?.split("-")[0];
}

export function getLocalizedLanguageName(languageCode: string, locale: string): string { 
	const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
	return displayNames.of(languageCode)
}

export function getLocalizedRegionName(region: string, locale: string): string { 
	const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
	return regionNames.of(region)
}

/** a string for the ISO 8601 format name: iso, iso 8601 or 8601  */
export const REG_ISO = /\b(?:iso(?:\s*8601)?|8601)\b/i;

/** a string representing a locale (IETF Language Tag see https://en.wikipedia.org/wiki/IETF_language_tag)
 * - lang (2 or 3 lowercase) ! en, fr, zh
 * - script (Uppercase with 3 lowercase) : Hans (https://en.wikipedia.org/wiki/ISO_15924)
 * - country (2 Uppercase) : DE, CN
 * - extensions (-u followed by one or more suites of lowercase or digits) : DE, CN
 * @throws RangeError if not a valid locale
 */
export const REG_LOCALE = /(\b[a-z]{2,3}\b)(-[A-Z][a-z]{3}\b)?(-[A-Z]{2}\b)?(-[a-z](-[a-z0-9]{2,8})+\b)*/
export function parseLocale(loc:string):LocaleInfo {
	const vers = process.version
  const m = REG_LOCALE.exec(loc)
  if (m) {
    const result:LocaleInfo = {
      lang: m[1],
      ...(m[2] ? { script: sentenceCase(m[2].substring(1))} : {}),
      ...(m[3] ? { region: m[3].substring(1).toUpperCase()} : {}),
      ...(m[4] ? { extensions: m[4].substring(1).toLowerCase()} : {}),
	  locale: loc
    }
	result.locale = getCanonicalLocale(result)
	return result;
  } else 
    throw new RangeError(`"${loc}" is not a valid locale`)
}

export function getCanonicalLocale(locale:LocaleInfo):string {
	let result = locale.lang.toLowerCase()
	if (locale.script) {
		result += "-" + sentenceCase(locale.script)
	}
	if (locale.region) {
		result += "-" + locale.region.toUpperCase()
	}
	if (locale.extensions) {
		result += "-" + locale.extensions.toLowerCase()
	}
	return result
}

export function sentenceCase(text:string) {
	return text?.[0].toUpperCase() + text?.substring(1).toLowerCase()
}

/** returns true if someLocale is compatible with targetLocale
 * @throws RangeError if not a valid locale
 * Returns true if :
 * - same language
 * - if target specifies country, same country
 * - if taget specifies script, same script
 */
export function localeIsCompatibleWith(someLocale:string, targetLocale:string):boolean {
	const some = parseLocale(someLocale)	// null if not a valid locale
	const target = parseLocale(targetLocale) // null if not a valid locale
	let result = false
	if (some && target) {
		// we have 2 locales
		result = (some.lang == target.lang)
			&& (!target.region || some.region == target.region)
			&& (!target.script || some.script == target.script)
			
	}
	return result;
}

/** create the user readable description for a locale */
export function makeDescriptionForLocale(info:LocaleInfo, locale:string):string {
	const language = getLocalizedLanguageName(info.lang, locale)
	if (info.region) {
		const region = getLocalizedRegionName(info.region, locale)
		if (info.script) {
			return LLL.utils.intl.localeDescriptionWithRegionAndScript({language, region, script:info.script})
		} else {
			return LLL.utils.intl.localeDescriptionWithRegion({language, region})
		}
	} if (info.script) {

		return LLL.utils.intl.localeDescriptionWithScript({language, script:info.script})
	} else {
		return language;
	}
}

// return an array of month names for a locale
export function getIntlMonthNames(locale:string, format: "long" | "short" | "narrow" |"numeric" | "2-digit") {
    const formatter = new Intl.DateTimeFormat(locale, { month: format });
    const months = [];
    for (let month = 0; month < 12; month++) {
        const date = new Date(2020, month, 1); // Using a fixed year and day
        months.push(formatter.format(date));
    }
    return months;
  };

  /**
   * 
   * @returns the IANA name for the timzone of the user
   */
  export function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  /** builds a Dictionnary of day names to day numbers for a locale */
  export function getIntlWeekdayNames(locale:string, format: "long" | "short" | "narrow") {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
    const weekdays = [];
    for (let day = 0; day < 7; day++) {
        // 2024.01.07 is a sunday
        const date = new Date(2024, 0, 7 + day); // Using a fixed year and month, starting from Thursday
        weekdays.push(formatter.format(date));
    }
    return weekdays;
  };

  export interface WeekInfo {
	firstDay: number;
	minDays: number;
	weekend: number[];
  }
  
/** returns the first day of the week (0 is sunday)
 * 
 * Uses the .getWeekInfo() method, which is not yet in the JS standard
 * - it is a stage 3 proposal https://github.com/tc39/proposal-intl-locale-info
 * - in MDN, support in Chrome
 * - there is a polyfill : https://www.npmjs.com/package/@bart-krakowski/get-week-info-polyfill
 * 
 */
  export function getIntlWeekInfo(locale:string):WeekInfo { 
	const info:any  = new Intl.Locale(locale)
	let wi = info.weekInfo;
	if (!wi && info.getWeekInfo) {
		wi = info.getWeekInfo();
	}
	if (wi) {
		const result:WeekInfo = {firstDay:wi.firstDay % 7, minDays:wi.minDays, weekend:
			wi.weekend.map((x:number) => x % 7)
		}
		return result
	} else {
		return undefined;
	}
}

/** returns the first day of the week (0 is sunday)
 * 
 * is no info for <locale>, returns 1 (Monday) as it is the ISO standard
 */
export function getIntlWeekStart(locale:string):number { 
	return getIntlWeekInfo(locale)?.firstDay || 1;
}
  /** Compute the UTC offset string for ianaZone on a specific
   * 
   * @param ianaZone defaults to getUserTimezone()
   * @param when  defaults to now
   * @returns the timezone offset string, in formet "+04:00" or ("-06:45")
   */
  export function timezoneOffset(ianaZone:string = getUserTimezone(), when:Date = new Date()):string {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: "longOffset", // timezone will be like "GMT+02:00" or "GMT-04:30"
    })
    const zone = fmt.formatToParts(when).find((x) => x.type == "timeZoneName")?.value;
    const match = /([-+])(\d\d):(\d\d)/i.exec(zone);
    if (!match) { throw new Error(`longOffset format for ${ianaZone} does not have the expected format : ${zone}`) }
    return match[0]
  }

  
  /** format a **timestamp** with Intl
   * @param options the options to use (will be cleaned with @link cleanDateTimeFormat)
   * @param locale the locale to use for formatting
   * @param date optional, defaults to current Date
   */
  export function formatDateTimeWithIntl(dateSettings:Intl.DateTimeFormatOptions, locale:string = undefined, date:Date = new Date()) {
	return new Intl.DateTimeFormat(locale, cleanDateTimeFormat(dateSettings)).format(date)
  }
   /** format a **date** with Intl
   * @param options the options to use (will be cleaned with @link toDateOnlyOptions)
   * @param locale the locale to use for formatting
   * @param date optional, defaults to current Date
   */
   export function formatDateWithIntl(dateSettings:Intl.DateTimeFormatOptions, locale:string = undefined, date:Date = new Date()) {
	return new Intl.DateTimeFormat(locale, toDateOnlyOptions(dateSettings)).format(date)
  }
  /** format a **time** with Intl.
   * Reutrns undefined is no time options (and not a short date)
  * @param options the options to use (will be cleaned with @link toTimeOnlyOptions)
  * @param locale the locale to use for formatting
  * @param date optional, defaults to current Date
  */
  export function formatTimeWithIntl(dateSettings:Intl.DateTimeFormatOptions, locale:string = undefined, date:Date = new Date()) {
   const cleanOptions = toTimeOnlyOptions(dateSettings);
   let result:string;
   if (Object.keys(cleanOptions).length !== 0) {
	result = new Intl.DateTimeFormat(locale, cleanOptions).format(date)
   } else {
	result = undefined
   }
   return result;
 }
  
  /** clean  Intl.DateTimeFormatOptions
   * - if dateStyle is specified, then year, month, day and weekday should no be
   * - if timeStyle is specified, then hour, minute, second and hour12 should no be
  */
  export function cleanDateTimeFormat(dateTimeOptions:Intl.DateTimeFormatOptions) {
	let copy = { ...dateTimeOptions }
	if (copy.dateStyle) { delete copy.year; delete copy.day; delete copy.month; delete copy.weekday; }
	if (copy.timeStyle) { delete copy.hour; delete copy.minute; delete copy.second; delete copy.hour12;  }
	return copy;
  }

  export function toDateOnlyOptions(options:Intl.DateTimeFormatOptions) {
	const result:Intl.DateTimeFormatOptions = { }
	if (options.calendar) result.calendar = options.calendar;
	if (options.era) result.era = options.era;
	if (options.formatMatcher) result.formatMatcher = options.formatMatcher;
	if (options.localeMatcher) result.localeMatcher = options.localeMatcher;
	if (options.dateStyle) { 
		result.dateStyle = options.dateStyle
 	} else {
		if (options.year) result.year = options.year;
		if (options.month) result.month = options.month;
		if (options.day) result.day = options.day;
		if (options.weekday) result.weekday = options.weekday;
	}
	return result;
  }
  
  export function toTimeOnlyOptions(options:Intl.DateTimeFormatOptions):Intl.DateTimeFormatOptions {
	const result:Intl.DateTimeFormatOptions = { }
	if (options.hour12) result.hour12 = options.hour12;
	if (options.hourCycle) result.hourCycle = options.hourCycle;
	if (options.formatMatcher) result.formatMatcher = options.formatMatcher;
	if (options.localeMatcher) result.localeMatcher = options.localeMatcher;
	if (options.timeStyle) { 
		result.timeStyle = options.timeStyle
 	} else {
		if (options.hour) result.hour = options.hour;
		if (options.minute) result.minute = options.minute;
		if (options.second) result.second = options.second;
	}
	return result;
  }