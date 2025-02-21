
International Dates hopes to be useful to the following users when they need to integrate dates in their writing : 
- people who work in mutiple languages
- people using a language other than English
- people who need to convert dates in a variety of formats
- people who prefer to use phrases to refer to dates

To preserve focus and simplicity, International Dates does not support : 
- handling the time part of dates
- when linking, using another target format than the one of daily notes

# You work in mutiple languages

When converting dates, International Dates offers several ways to format in foreign formats :

## By adding a suffix with formating flags
- just add a suffix to the current date, like "@es" to convert it to this specific locale of "@\<format\> to use one your prefered formats
    `2022-07-04@fr;long` will be converted to `4 juillet 2022`
    `2022-07-04@he` will be converted to `ום שני, 4 ביולי 2022`
- region names are supported
    `2022-07-04@fr-CH;short` will be formatted as `04.07.22`
    `2022-07-04@fr-BE;short` will be formatted as `4/07/22`

## By creating user formats

In the settings you can define your prefered formats, selecting a locale and either a standard international format (short, medium, long or full) or custom settings for date parts.


# people using a single language but prefer using their local date formats

International Dates can be also extrememly useful if your work in a single language, and need to easily format dates in your local or prefered format.

This can be useful : 
- to display month and weekday names in your language : `4 de julho de 2022` in Portuguese, `2022年7月4日` in Japanese or `Δευτέρα 4 Ιουλίου 2022` in Greek
- to use the proper short date format in your region : `7/4/22`in the US, `04/07/2022` in Great-Britain of `2022-07-04` in english speaking part of Canada or `04/07/22` in India

International Dates also support selecting in specific numberting system (this requires a good knowledge of IETF language tag structure). For example in arabic, the date is `١٠ يناير ٢٠٢٥` in with arabic numbers, or  `10 يناير 2025` with Latin number (using locale `ar-u-nu-latn`)


# For people who use other calendars

The Greogrian calendar is widely used worldwide, but other calendars also have wide audiences. International Dates allows user to specify those calendars in their prefered formats.

`January 10, 2025` in the gregorian calendar(en-u-ca-gregory), `11 rajab 1446 AH` in the islamic calendar, `Twelfth Month 11, 2024(jia-chen)` in the chinese and `January 10, 7 Reiwa` in the Japanese (examples in english for understanbility )


# For people who need to convert dates in a variety of formats

Because of your personal preferences, or the habits of your group or community, you may have to display dates in custom formats, like month and year. International Dates prefered formats allow you to define your own, without learning any formating string like in Moment.js. 

For example, should you need only month and year, you can define formats like `January 22`, `Jan 22` or even `J 22` (which is ambiguous in English though)

# For people who use week numbers

In many professional communities, refering to dates using week numbers is very common. 

International Dates comes with a very thorough support for week numbers :
- by parsing the ISO date format for weeks, like `2024-W03-1` (monday of the third week of 2024)
- by offering suggestions of week numbers (input of `@mond` suggests `monday of week 33`, `monday of week 34`)

# For people who prefer to use phrases to refer to dates, in their own language

The work on International Dates initial aim was not to develop a new plugin, but to add multiple language support to the very useful Natural Language Dates plugin. The decision to make a new plugin was made afterwards, when it appeared that the native Javascript Intl services had support for nearly all locales.

In all its supported locales, International Dates recognizes expressions like :
- relative day names : today, tomorrow, yesterday...
- day names : this monday, next tuesday, monday of next week
- relative dates using durations: in 3 days, 5 weeks ago
- day in numbered weeks : monday of week 33



