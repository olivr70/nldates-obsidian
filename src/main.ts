import { MarkdownView, ObsidianProtocolData, Plugin } from "obsidian";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";

import { DateDisplay, MarkdownDateParts, FormattedDate, IDateSuggestion, IInternationalDatesPlugin, INLDParser, IMarkdownFlags, NLDResult, InternationalDateSettings, UserDateFormat, FormatRef } from "./types";
import { findUniqueName, makeSingleLine, parseTruthy } from "./utils/tools";
import { generateMarkdownLink, getOrCreateDailyNote } from "./utilsObsidian";
import { NLDSettingsTab, DEFAULT_SETTINGS } from "./settings";
import { parserFactory } from "./parser";
import DatePickerModal from "./modals/date-picker";
import DateSuggest from "./suggest/date-suggest";
import {
  getParseCommand,
  getCurrentDateCommand,
  getCurrentTimeCommand,
  getNowCommand,
} from "./commands";
import { debugNotif, notifyError, notifyMessage, setDevMode } from "./utils/osbidian";
import dayjs from "dayjs";
import { INTL_DATE_STYLE_DICT, isIntlDateStyle } from "./suggest/suggest-utils";
import { formatDateTimeWithIntl, formatDateWithIntl, formatTimeWithIntl, langFromLocale, localeIsCompatibleWith, REG_ISO } from "./utils/intl";
import { dayjsWithLocale } from "./utils/days";
import { debug, enterLeave } from "./utils/debug";
import { pickUserFormat } from "./modals/fuzz-user-format-selector";
import { pickLocale } from "./modals/fuzz-locale-selector";
import { getUiLocale, setUiLocale } from "./i18n/localize";
import { loadAllLocales } from "./i18n/i18n-util.sync";


import { LLL } from "./i18n/localize";
import { loadedLocales, locales } from "./i18n/i18n-util";



export default class InternationalDates extends Plugin implements IInternationalDatesPlugin {
  private _parser: INLDParser;
  public settings: InternationalDateSettings;

  public get parser(): INLDParser { return this._parser; }


  //#region lifecycle
      async onload(): Promise<void> {
        console.log("locales", locales)
        console.log("loadedLocales", loadedLocales)
        loadAllLocales();
        setUiLocale(window.localStorage.getItem('language'));
        console.log("getUiLocale", getUiLocale())

        console.log("loadedLocales", loadedLocales)
        console.log("LLL", LLL)
        console.log("PARSE_DATE_AS_TEXT", LLL.commands.PARSE_DATE_AS_TEXT())
        console.log("HI", LLL.HI({name:"John"}))

        notifyMessage("Setting loaded")
        await this.loadSettings();
        this.validateSettings();

        this.addCommand({
          id: "id-dates-debug-on",
          name: "enable dev mode",
          callback: () => setDevMode(true),
          hotkeys: [],
        });
        
        this.addCommand({
          id: "id-dates-debug-off",
          name: "disable dev mode",
          callback: () => setDevMode(false),
          hotkeys: [],
        });

        this.addCommand({
          id: "nlp-dates",
          name: LLL.commands.PARSE_DATE(),
          callback: () => getParseCommand(this, {mode: "replace"}),
          hotkeys: [],
        });

        this.addCommand({
          id: "id-dates-link",
          name: LLL.commands.PARSE_DATE_AS_LINK(),
          callback: () => getParseCommand(this, {mode: "link"}),
          hotkeys: [],
        });

        this.addCommand({
          id: "id-date-clean",
          name: LLL.commands.PARSE_DATE_AS_TEXT(),
          callback: () => getParseCommand(this, {mode: "clean"}),
          hotkeys: [],
        });

        this.addCommand({
          id: "id-format-user",
          name: LLL.commands.PARSE_AND_FORMAT_USER(),
          callback: () => {
            pickUserFormat(this, (format) => {
              getParseCommand(this, { mode:"user", format:format.name } )
            })
          }
        })

        

        this.addCommand({
          id: "id-format-locale",
          name: LLL.commands.PARSE_AND_FORMAT_LOCALE(),
          callback: () => {
            pickLocale(this, (locale) => {
              getParseCommand(this, { mode:"locale", locale } )
            })
          }
        })
        
        this.addCommand({
          id: "id-format-dialog",
          name: LLL.commands.PARSE_AND_FORMAT_DIALOG(),
          callback: () => {
            console.log("id-format-dialog", this)
            getParseCommand(this, { mode:"dialog" } )
          }
        })

        this.addCommand({
          id: "id-now",
          name: "Insert the current date and time",
          callback: () => getNowCommand(this),
          hotkeys: [],
        });

        this.addCommand({
          id: "id-today",
          name: "Insert the current date",
          callback: () => getCurrentDateCommand(this),
          hotkeys: [],
        });

        this.addCommand({
          id: "id-picker",
          name: "Date picker",
          checkCallback: (checking: boolean) => {
            if (checking) {
              return !!this.app.workspace.getActiveViewOfType(MarkdownView);
            }
            new DatePickerModal(this.app, this).open();
          },
          hotkeys: [],
        });

        this.addSettingTab(new NLDSettingsTab(this.app, this));
        this.registerObsidianProtocolHandler("nldates", this.actionHandler.bind(this));
        this.registerEditorSuggest(new DateSuggest(this.app, this));

        this.app.workspace.onLayoutReady(() => {
          this.initFromSettings();
        });
      }

      onunload(): void {
        console.log("Unloading natural language date parser plugin");
      }
  //#endregion

  //#region settings ----------------------
      
      async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
      }

      validateSettings() {
        debugNotif("will validate settings")
        const lang = window.localStorage.getItem('language');
        // create default date formats
        if (this.settings.dateFormats == undefined || this.settings.dateFormats.length == 0) {
          new Notification("NLD")
          this.settings.dateFormats = [
            { name: `iso`,locale: "sv-SE", dateStyle: "short"},
            { name: `${lang}1`,locale: lang, dateStyle: "long"},
            { name: `${lang}2`,locale: lang, dateStyle: "short"},
          ]
        }
        // Make sure format names are unique
        // this.settings.dateFormats.forEach( 
        //   (f) => f.name = findUniqueName(f.name, 
        //     (n) => this.settings.dateFormats.findIndex(
        //       (e) => e.name != n) == -1))
        
        // Make sure format names are unique
        this.settings.dateFormats.forEach( 
          (f, i) => f.name = this.findUniqueFormatName(f.name))
        // Make sure selected format exists
        debugNotif(`Before selectedFormat ${this.settings.selectedFormat}`)
        if (!this.settings.selectedFormat) {
          // no selecteFormat, use the first one
          this.settings.selectedFormat = this.settings.dateFormats[0].name
        } else {
          const selecteIndex = this.settings.dateFormats.findIndex((f) => f.name == this.settings.selectedFormat)
          if (selecteIndex == -1) {
            this.settings.selectedFormat = this.settings.dateFormats[0].name;
          }
        }
        debugNotif(`After selectedFormat ${this.settings.selectedFormat}`)
      }

      async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
        this.initFromSettings();
      }

      

      async validateAndSaveSettings() {
        try {
          this.validateSettings();
          await this.saveSettings()
          notifyMessage("Natural Language Dates  : settings saved")
        } catch(reason) {
            notifyError("Natural Language Dates  : unable to save setting")
        }
      }

      /** validates settings and saves them */
      validateAndSaveSettingsSync() {
        this.validateSettings();
        this.saveSettings()
          .then(() => { notifyMessage("Natural Language Dates  : settings saved")})
          .catch((reason) => {
            notifyError("Natural Language Dates  : unable to save setting")
          });
      }

      initFromSettings() {
        console.log("************** SETTINGS CHANGED **************")
          // initialize the parser when layout is ready so that the correct locale is used
          this._parser = parserFactory(this.settings.locale);
      }
      

      findUniqueFormatName(base:string):string {
        return findUniqueName(base, 
          (name) => {
            const formatsWithSameName = this.settings.dateFormats.filter(f => f.name == name);
            return formatsWithSameName.length <= 1
        })

      }
  //#endregion

  //#region Parsing
      /* Parse a date and format it using the current locale
      
        @param dateString: A string that contains a date in natural language, e.g. today, tomorrow, next week
        @param format: A string that contains the formatting string for a Moment
        @returns NLDResult: An object containing the date, a cloned Moment and the formatted string.
      */
      parse(dateString: string, formatToUse?: string): NLDResult {
        return enterLeave("parse", () => {
          const date = this.parser.getParsedDate(dateString);
          const formattedString = this.getFormattedDate(date, formatToUse);
          if (formattedString === "Invalid Date") {
            notifyError(`International Dates : Sorry, '${dateString}' is not recognized as a date in locale ${this.settings.locale} `);
          }

          return {
            formattedString,
            date,
            moment: this.parser.moment(date),
          };
        })
      }

      /*
        @param dateString: A string that contains a date in natural language, e.g. today, tomorrow, next week
        @returns NLDResult: An object containing the date, a cloned Moment and the formatted string.
      */
      parseDate(dateString: string): NLDResult {
        return this.parse(makeSingleLine(dateString));
      }

      parseTime(dateString: string): NLDResult {
        return this.parse(dateString);
      }
  //#endregion

  //#region UserFormats

  /** @override */
  getDefaultUserDateFormat():UserDateFormat {
    return this.getFirstUserDateFormatFromName(this.settings.selectedFormat) 
      ?? this.settings.dateFormats[0] 
      ?? { name:"default", locale: this.settings.locale, dateStyle: "long"}
  }

  /** return a UserDateFormat from its exact name */
  getUserDateFormat(formatName:string):UserDateFormat {
    return this.settings.dateFormats.find(e => e.name == formatName)
  }
  /** return the first UsetDateFormat from a prefix */
  findUserDateFormat(filter:(x:UserDateFormat) => boolean):UserDateFormat[] {
    return this.settings.dateFormats.filter(filter)
  }
  /** returns the first UsetDateFormat matching <filter>, or undefined */
  getFirstUserDateFormat(filter:(x:UserDateFormat) => boolean):UserDateFormat {
    const items = this.findUserDateFormat(filter)
    return items.length > 0 ? items[0] : undefined;
  }
  getFirstUserDateFormatFromName(key:string) {
    return this.getUserDateFormat(key) ?? this.getFirstUserDateFormat(x => x.name.startsWith(key.toLocaleLowerCase(this.settings.locale)))
  }
  
  /** @override */
  getFirstUserDateFormatFromLocale(someLocale:string) {
    return this.getFirstUserDateFormat(x => x.locale == someLocale)
      ?? this.getFirstUserDateFormat(x => x.locale.startsWith(someLocale))
      ?? this.getFirstUserDateFormat(x => langFromLocale(x.locale) == langFromLocale(someLocale))
  }

  /** @override */
  getFirstUserDateFormatFromFlags(flags:IMarkdownFlags):UserDateFormat {
    return this.getFirstUserDateFormatFromName(flags?.format)
      ?? this.getFirstUserDateFormatFromLocale(flags?.locale)
  }

  /** format as **date** using the current locale */
  getFormattedDate(dateValue:Date, formatToUse: FormatRef):string {
    return this.formatDate(dateValue,formatToUse).dateStr;
  }
  /** format as **time** using the current locale */
  getFormattedTime(dateValue:Date, formatToUse: FormatRef):string {
    return this.formatDate(dateValue,formatToUse).timeStr;
  }
  /** format as **timestamp** using the current locale */
  getFormattedTimestamp(dateValue:Date, formatToUse: FormatRef):string {
    const f = this.formatDate(dateValue,formatToUse);

    return f.timestampStr ?? f.dateStr + this.settings.separator + f.timeStr;
  }
  //#endregion

  //#region Formating
      /** @override */
      generateMarkdownToInsert(date:MarkdownDateParts, ctrlKey = false, altKey = false, shiftKey = false) {
        let newText = ""
        let makeIntoLink = (date.asLink !== undefined ?  date.asLink : this.settings.autosuggestToggleLink);
        // Ctrl key is used to invert makeIntoLink setting
        if (altKey) { makeIntoLink = true; date.asLink = true; date.linkToDailyNotes = true; }
        
        if (makeIntoLink) {
          newText = this.generateLinkForDate(date)
        } else {
          switch (date.display) {
            case DateDisplay.asDate : newText = date.dateStr; break;
            case DateDisplay.asTime : newText = date.timeStr; break;
            case DateDisplay.asTimestamp : 
              newText = date.dateStr + this.settings.separator + date.timeStr; 
              break;
          }
        }
        return newText;
      }

      
        /** convert suggestion to a link */
        private generateLinkForDate(items:MarkdownDateParts) {
          let result:string;
          // generate the markdown link, always with the date part
          if (items.linkToDailyNotes) {
            // link to daily note
            const dailyNoteName = this.getFormattedDate(items.dateValue,getDailyNoteSettings().format);
            result = generateMarkdownLink(
              this.app,
              dailyNoteName,
              items.dateStr
            );
          } else {
            result = generateMarkdownLink(
              this.app,
              items.dateStr
            );
          }
          
          if (items.display == DateDisplay.asTimestamp) {
            result += this.settings.separator + items.timeStr;
          }
          return result;
        }

        
      /** formats a suggestion based on user indications and settings */
      suggestionToMarkdown(suggestion:IDateSuggestion):MarkdownDateParts {  // use the date provided by the suggester if set
        return enterLeave('suggestionToMarkdown!', () => {
          debug("suggestion",suggestion)
        const dateValue = this.getSuggestionDateValue(suggestion)
         debug("date=", dateValue)
       
        let result = this.dateToMarkdown(dateValue, suggestion);
        return result;
      })
      }
        
      /** formats a suggestion based on user indications and settings
       */
      dateToMarkdown(dateValue:Date, flags:IMarkdownFlags):MarkdownDateParts {
        return enterLeave("dateToMarkdown", () => {
          // --------------------------------------------------------------
          // prefer specific format, default to the format in settings
          let locale:string;
          let formatToUse:string;
          if (flags.locale || flags.format) {
            locale = flags.locale
            formatToUse = flags.format
          } else {
            formatToUse = this.settings.selectedFormat
            locale = this.settings.locale
          }
          debug("locale",locale)
          debug("format", formatToUse)
          const dateParts = this.formatDate(dateValue, formatToUse, locale)
          debug("dateParts", dateParts)
          // --------------------------------------------------------------
          // display as Date if not display style is selecetd
          let display = flags.display ?? DateDisplay.asDate;
          // display as link
          const linkToDailyNotes = flags.linkToDailyNotes ?? this.settings.linkToDailyNotes;
          // always display as link if user wants to linkToDailyNote
          let asLink:boolean = (display != DateDisplay.asTime) && (linkToDailyNotes || flags.asLink);

          // return the reulst
          const result = {
            ...dateParts, 
            display, 
            asLink, 
            linkToDailyNotes
          }
          return result;
        })
      }

      /** get the Date value from the suggestion
       * Is Suggester has already computed the Date, use it
       * Otherwise use parseDate() on the value string, of the .label
       */
      getSuggestionDateValue(suggestion:IDateSuggestion):Date {
            
        if (suggestion.value instanceof Date) {
          return suggestion.value
        } else {
          // needs to parse the suggestion
          const dateSuggestion:string = suggestion.valueString || suggestion.label || suggestion.text;
          const parseResult = this.parseDate(dateSuggestion);
          return parseResult.date;
          // time  cannot be a link
        }
      }

      /** @override
       */
      formatDate(dateValue:Date, formatToUse:FormatRef, locale?:string):FormattedDate {
        return enterLeave("formatDate", () => {
          formatToUse = formatToUse?.trim()
          // if user specifies a localised Moment.js format (L, LL, LLL or LLLL)
          // switch to Intl display styles, to use Intl library, which has more locales
          if (/L{1,4}/.test(formatToUse)) {
            formatToUse = INTL_DATE_STYLE_DICT[formatToUse];
          }
          debug("formatToUse=", formatToUse, "locale=",locale)

          // format with
          let userFormat:UserDateFormat;
          if (formatToUse) {
            // try to get expected user format
            userFormat = this.getUserDateFormat(formatToUse) // may be undefined
          }
          if (!userFormat && !formatToUse && locale) {
            // if no user format, but a locale, get the first user format for that locale
            userFormat = this.findUserDateFormat((x) => localeIsCompatibleWith(x.locale, locale))?.[0]
            if (!userFormat) {
              userFormat = { name: `default for ${locale}`, locale, dateStyle:"long"}
            }
          }
          debug("userFormat=", userFormat)

          let dateStr = "<???>"
          let timeStr = "<???>"
          let timestampStr = undefined // set only if the separator in settings needs to be overriden
          // we know have dateValue
          if (REG_ISO.test(formatToUse)) {
            debug("using iso")
            dateStr = dayjs(dateValue).format("YYYY-MM-DD")
            timeStr = dayjs(dateValue).format("HH:mm")
            timestampStr = dateStr + "T" + timeStr 
          } else if (userFormat) {
            debug("using user format",userFormat)
            dateStr = this.formatDateWithUserFormat(userFormat, dateValue)
            timeStr = this.formatTimeWithUserFormat(userFormat, dateValue)
          } else if (isIntlDateStyle(formatToUse)) {
            debug("using Intl", locale, formatToUse)
            // we have a Intl format name. Use Intl => this is the prefered option, as we have all locales
            dateStr = new Intl.DateTimeFormat(locale, {dateStyle:formatToUse}).format(dateValue);
            timeStr = new Intl.DateTimeFormat(locale, {timeStyle:"medium"}).format(dateValue);
          } else if (formatToUse) {
            // WARNING : only preloaded locales can be used. Localised formats like LLLL, LLL not supported
            // const dayjsValue =  dayjsWithLocale(dateValue, locale)
            const dayjsValue =  dayjs(dateValue)
            debug("using dayjs", dateValue, dayjsValue)
            dateStr = dayjsValue.format(formatToUse);
            timeStr = dayjsValue.format(this.settings.timeFormat);
          } else {
            // nothing asked for, use the default format selected by the user
            debug("using default user format")
            const defaultFormat = this.getDefaultUserDateFormat() // never undefined
            dateStr = this.formatDateWithUserFormat(defaultFormat, dateValue)
            timeStr = this.formatTimeWithUserFormat(defaultFormat, dateValue)
          }
          return { dateValue, dateStr, timeStr,  ...(timestampStr && { timestampStr }) }
        })
      }

      
      /** @override */
      formatDateWithUserFormat(userFormat:UserDateFormat, date:Date) {
        return formatDateWithIntl(userFormat, userFormat?.locale ?? this.settings.locale, date)
      }
      /** @override 
       * 
       * If no time settings, returns a time with timeStyle = "short"
      */
      formatTimeWithUserFormat(userFormat:UserDateFormat, date:Date) {
        return formatTimeWithIntl(userFormat, userFormat.locale ?? this.settings.locale, date)
          ?? formatTimeWithIntl({timeStyle:"short"}, userFormat.locale ?? this.settings.locale, date)
      }
  //#endregion


  /** handles obsidian://nldates?day=&newPane= */
  async actionHandler(params: ObsidianProtocolData): Promise<void> {
    const { workspace } = this.app;

    const parseResult = this.parseDate(params.day);
    const newPane = parseTruthy(params.newPane || "yes");

    if (parseResult.moment.isValid()) {
      const dailyNote = await getOrCreateDailyNote(window.moment(parseResult.date));
      workspace.getLeaf(newPane).openFile(dailyNote);
    }
  }
}
