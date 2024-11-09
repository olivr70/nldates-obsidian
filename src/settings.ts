import { App, PluginSettingTab, Setting } from "obsidian";
import moment from "moment"

import { DayOfWeek, AllChronoLocales, ChronoLocale } from "./types";
import { getLocaleWeekStart } from "./utils/tools";
import NaturalLanguageDates from "./main";



export interface NLDSettings {
  autosuggestToggleLink: boolean;
  autocompleteTriggerPhrase: string;
  isAutosuggestEnabled: boolean;

  format: string;
  timeFormat: string;
  separator: string;
  locale: ChronoLocale;
  weekStart: DayOfWeek;

  modalToggleTime: boolean;
  modalToggleLink: boolean;
  linkToDailyNotes: boolean;
  modalMomentFormat: string;
}

export const DEFAULT_SETTINGS: NLDSettings = {
  autosuggestToggleLink: true,
  autocompleteTriggerPhrase: "@",
  isAutosuggestEnabled: true,

  format: "YYYY-MM-DD",
  timeFormat: "HH:mm",
  separator: " ",
  locale: "en",
  weekStart: "locale-default",

  modalToggleTime: false,
  modalToggleLink: false,
  linkToDailyNotes: false,
  modalMomentFormat: "YYYY-MM-DD HH:mm",
};

const chronoLocales = Object.values(AllChronoLocales);

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];



export class NLDSettingsTab extends PluginSettingTab {
  plugin: NaturalLanguageDates;

  constructor(app: App, plugin: NaturalLanguageDates) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const localizedWeekdays = window.moment.weekdays();
    const localeWeekStart = getLocaleWeekStart();

    containerEl.empty();

    containerEl.createEl("h2", {
      text: "Natural Language Dates",
    });

    containerEl.createEl("h3", {
      text: "Parser settings",
    });

    // display help text and link to moment.js format documentation
    const dateFormatDesc = document.createDocumentFragment();
    dateFormatDesc.appendText(`Output format for parsed dates.`)
    dateFormatDesc.appendChild(document.createElement('br'))
    dateFormatDesc.appendText("Use 'iso' or empty for ISO 8601 standard format.")
    dateFormatDesc.appendChild(document.createElement('br'))
    dateFormatDesc.appendText("For more details, you can read the ")
    const link = document.createElement('a');
    link.href = 'https://momentjs.com/docs/?/displaying/format/#/displaying/';
    link.textContent = 'Moment.js documentation';
    link.title = "Moment.js | Docs";
    dateFormatDesc.appendChild(link);
    dateFormatDesc.appendText(`. Localized like LL can be used.`)
    dateFormatDesc.appendChild(document.createElement('br'))
    dateFormatDesc.appendText(`Current version of Moment.js is ${moment.version}`)

    new Setting(containerEl)
      .setName("Date format")
      //.setDesc("")
      .setDesc(dateFormatDesc)
      .addMomentFormat((text) =>
        text
          .setDefaultFormat("YYYY-MM-DD")
          .setValue(this.plugin.settings.format)
          .onChange(async (value) => {
            this.plugin.settings.format = value || "YYYY-MM-DD";
            await this.plugin.saveSettings();
          })
      );

      new Setting(containerEl)
      .setName("Locale")
      .setDesc("Which locale to use")
      .addDropdown((dropdown) => {
        dropdown.addOption("locale-default", `Locale default (${localeWeekStart})`);
        chronoLocales.forEach((loc, i) => {
          dropdown.addOption(chronoLocales[i], loc);
        });
        dropdown.setValue(this.plugin.settings.locale.toLowerCase());
        dropdown.onChange(async (value: ChronoLocale) => {
          this.plugin.settings.locale = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Week starts on")
      .setDesc("Which day to consider as the start of the week")
      .addDropdown((dropdown) => {
        dropdown.addOption("locale-default", `Locale default (${localeWeekStart})`);
        localizedWeekdays.forEach((day, i) => {
          dropdown.addOption(weekdays[i], day);
        });
        dropdown.setValue(this.plugin.settings.weekStart.toLowerCase());
        dropdown.onChange(async (value: DayOfWeek) => {
          this.plugin.settings.weekStart = value;
          await this.plugin.saveSettings();
        });
      });

    containerEl.createEl("h3", {
      text: "Hotkey formatting settings",
    });

    new Setting(containerEl)
      .setName("Time format")
      .setDesc("Format for the hotkeys that include the current time")
      .addMomentFormat((text) =>
        text
          .setDefaultFormat("HH:mm")
          .setValue(this.plugin.settings.timeFormat)
          .onChange(async (value) => {
            this.plugin.settings.timeFormat = value || "HH:mm";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Separator")
      .setDesc("Separator between date and time for entries that have both")
      .addText((text) =>
        text
          .setPlaceholder("Separator is empty")
          .setValue(this.plugin.settings.separator)
          .onChange(async (value) => {
            this.plugin.settings.separator = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", {
      text: "Date Autosuggest",
    });

    new Setting(containerEl)
      .setName("Enable date autosuggest")
      .setDesc(
        `Input dates with natural language. Open the suggest menu with ${this.plugin.settings.autocompleteTriggerPhrase}`
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.isAutosuggestEnabled)
          .onChange(async (value) => {
            this.plugin.settings.isAutosuggestEnabled = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Add dates as link?")
      .setDesc(
        "If enabled, dates created via autosuggest will be wrapped in [[wikilinks]]"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autosuggestToggleLink)
          .onChange(async (value) => {
            this.plugin.settings.autosuggestToggleLink = value;
            await this.plugin.saveSettings();
          })
      );

      
    new Setting(containerEl)
    .setName("Link to daily notes?")
    .setDesc(
      "If enabled, use the daily note format for [[wikilinks]]"
    )
    .addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.linkToDailyNotes)
        .onChange(async (value) => {
          this.plugin.settings.linkToDailyNotes = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl)
      .setName("Trigger phrase")
      .setDesc("Character(s) that will cause the date autosuggest to open")
      .addMomentFormat((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.autocompleteTriggerPhrase)
          .setValue(this.plugin.settings.autocompleteTriggerPhrase || "@")
          .onChange(async (value) => {
            this.plugin.settings.autocompleteTriggerPhrase = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
