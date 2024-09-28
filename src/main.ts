import { MarkdownView, ObsidianProtocolData, Plugin } from "obsidian";

import { INaturalLanguageDatesPlugin, INLDParser, NLDResult } from "./types";
import { parseTruthy } from "./utils";
import { getOrCreateDailyNote } from "./utilsObsidian";
import { NLDSettingsTab, NLDSettings, DEFAULT_SETTINGS } from "./settings";
import { parserFactory } from "./parser";
import DatePickerModal from "./modals/date-picker";
import DateSuggest from "./suggest/date-suggest";
import {
  getParseCommand,
  getCurrentDateCommand,
  getCurrentTimeCommand,
  getNowCommand,
} from "./commands";


export default class NaturalLanguageDates extends Plugin implements INaturalLanguageDatesPlugin {
  private _parser: INLDParser;
  public settings: NLDSettings;

  public get parser(): INLDParser { return this._parser; }

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addCommand({
      id: "nlp-dates",
      name: "Parse natural language date",
      callback: () => getParseCommand(this, "replace"),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-dates-link",
      name: "Parse natural language date (as link)",
      callback: () => getParseCommand(this, "link"),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-date-clean",
      name: "Parse natural language date (as plain text)",
      callback: () => getParseCommand(this, "clean"),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-parse-time",
      name: "Parse natural language time",
      callback: () => getParseCommand(this, "time"),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-now",
      name: "Insert the current date and time",
      callback: () => getNowCommand(this),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-today",
      name: "Insert the current date",
      callback: () => getCurrentDateCommand(this),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-time",
      name: "Insert the current time",
      callback: () => getCurrentTimeCommand(this),
      hotkeys: [],
    });

    this.addCommand({
      id: "nlp-picker",
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

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.initFromSettings();
  }

  initFromSettings() {
    console.log("************** SETTINGS CHANGED **************")
      // initialize the parser when layout is ready so that the correct locale is used
      this._parser = parserFactory(this.settings.locale);
      console.log("New parser : " + this._parser.constructor.name )
  }

  /* Parse a date and format it using the current locale
  
    @param dateString: A string that contains a date in natural language, e.g. today, tomorrow, next week
    @param format: A string that contains the formatting string for a Moment
    @returns NLDResult: An object containing the date, a cloned Moment and the formatted string.
  */
  parse(dateString: string, format: string): NLDResult {
    console.log(`NaturalLanguageDates.parse ${dateString} ${format}`)
    if (format.match(/iso(\s?8601)?/i)) {
      format = "YYYY-MM-DD"
    }
    const date = this.parser.getParsedDate(dateString, this.settings.weekStart);
    const formattedString = this.getFormattedDate(date, format);
    if (formattedString === "Invalid date") {
      console.debug("Input date " + dateString + " can't be parsed by nldates");
    }

    return {
      formattedString,
      date,
      moment: this.parser.moment(date),
    };
  }

  /*
    @param dateString: A string that contains a date in natural language, e.g. today, tomorrow, next week
    @returns NLDResult: An object containing the date, a cloned Moment and the formatted string.
  */
  parseDate(dateString: string): NLDResult {
    console.log(`NaturalLanguageDates.parseDate ${dateString}`)
    return this.parse(dateString, this.settings.format);
  }

  parseTime(dateString: string): NLDResult {
    console.log(`NaturalLanguageDates.parseTime ${dateString}`)
    return this.parse(dateString, this.settings.timeFormat);
  }

  /** format a date using the current locale */
  getFormattedDate(date:Date, format: string):string {
    return this._parser.getFormattedDate(date, format);
  }

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
