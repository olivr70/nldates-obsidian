import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import moment from "moment"

import { AllChronoLocales, ChronoLocale, InternationalDateSettings, UserDateFormat } from "./types";
import { getLocaleWeekStart } from "./utils/tools";
import InternationalDates from "./main";
import { SettingsDateFormatModal } from "./settings-date-format";
import { notifyError, notifyMessage } from "./utils/osbidian";
import { formatDateTimeWithIntl } from "./utils/intl";



export const DEFAULT_SETTINGS: InternationalDateSettings = {

  locale: "en",

  dateFormats: [
    { dateStyle: "short", locale:"sv-SE", name: "iso" }
  ],
  selectedFormat: "iso",

  isAutosuggestEnabled: true,
  autocompleteTriggerPhrase: "@",
  autosuggestToggleLink: true,

  modalToggleTime: false,
  modalToggleLink: false,
  linkToDailyNotes: false,


  // obsolete
  timeFormat: "HH:mm",
  separator: " ",
  modalMomentFormat: "YYYY-MM-DD HH:mm",
  // obsolete
  
  // weekStart: "locale-default",
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
  plugin: InternationalDates;

  // controls
  userFormatsContainer:HTMLElement;

  constructor(app: App, plugin: InternationalDates) {
    super(app, plugin);
    this.plugin = plugin;
  }

  get settings() { return this.plugin.settings; }

  display(): void {
    const { containerEl } = this;
    const localizedWeekdays = window.moment.weekdays();

    containerEl.empty();

    containerEl.createEl("h1", {
      text: "International Dates",
    });

    containerEl.createEl("h2", {
      text: "Date parsing",
    });

    
    new Setting(containerEl)
    .setName("Locale")
    .setDesc("Which locale to use to parse dates")
    .addDropdown((dropdown) => {
      dropdown.addOption("locale-default", this.settings.locale);
      chronoLocales.forEach((loc, i) => {
        dropdown.addOption(chronoLocales[i], loc);
      });
      dropdown.setValue(this.settings.locale.toLowerCase());
      dropdown.onChange(async (value: ChronoLocale) => {
        this.settings.locale = value;
        await this.validateAndSaveSettings();
      });
    });

    

    this.displayUserFormats(containerEl)

    containerEl.createEl("h2", {
      text: "Date Autosuggest",
    });

    new Setting(containerEl)
      .setName("Enable date autosuggest")
      .setDesc(
        `Input dates with natural language. Open the suggest menu with ${this.settings.autocompleteTriggerPhrase}`
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.settings.isAutosuggestEnabled)
          .onChange(async (value) => {
            this.settings.isAutosuggestEnabled = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
    .setName("Trigger phrase")
    .setDesc("Character(s) that will cause the date autosuggest to open")
    .addMomentFormat((text) =>
      text
        .setPlaceholder(DEFAULT_SETTINGS.autocompleteTriggerPhrase)
        .setValue(this.settings.autocompleteTriggerPhrase || "@")
        .onChange(async (value) => {
          this.settings.autocompleteTriggerPhrase = value.trim();
          await this.validateAndSaveSettings();
        })
    );
    
    containerEl.createEl("h2", {
      text: "Date formating",
    });

      
    new Setting(containerEl)
    .setName("Link to daily notes?")
    .setDesc(
      "If enabled, use the daily note format for [[wikilinks]]"
    )
    .addToggle((toggle) =>
      toggle
        .setValue(this.settings.linkToDailyNotes)
        .onChange(async (value) => {
          this.settings.linkToDailyNotes = value;
          await this.validateAndSaveSettings();
        })
    );

    // -------------------------------------------------
    containerEl.createEl("h2", {
      text: "Osbolete settings",
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
    
    // new Setting(containerEl)
    //   .setName("Date format")
    //   //.setDesc("")
    //   .setDesc(dateFormatDesc)
    //   .addMomentFormat((text) =>
    //     text
    //       .setDefaultFormat("YYYY-MM-DD")
    //       .setValue(this.settings.format)
    //       .onChange(async (value) => {
    //         this.settings.format = value || "YYYY-MM-DD";
    //         await this.validateAndSaveSettings();
    //       })
    //   );

    new Setting(containerEl)
      .setName("Time format")
      .setDesc("Format for the hotkeys that include the current time")
      .addMomentFormat((text) =>
        text
          .setDefaultFormat("HH:mm")
          .setValue(this.settings.timeFormat)
          .onChange(async (value) => {
            this.settings.timeFormat = value || "HH:mm";
            await this.validateAndSaveSettings();
          })
      );
      

    // new Setting(containerEl)
    // .setName("Week starts on")
    // .setDesc("Which day to consider as the start of the week")
    // .addDropdown((dropdown) => {
    //   dropdown.addOption("locale-default", `Locale default (${localeWeekStart})`);
    //   localizedWeekdays.forEach((day, i) => {
    //     dropdown.addOption(weekdays[i], day);
    //   });
    //   dropdown.setValue(this.settings.weekStart.toLowerCase());
    //   dropdown.onChange(async (value: DayOfWeek) => {
    //     this.settings.weekStart = value;
    //     await this.validateAndSaveSettings();
    //   });
    // });

    new Setting(containerEl)
      .setName("Separator")
      .setDesc("Separator between date and time for entries that have both")
      .addText((text) =>
        text
          .setPlaceholder("Separator is empty")
          .setValue(this.settings.separator)
          .onChange(async (value) => {
            this.settings.separator = value;
            await this.validateAndSaveSettings();
          })
      );

      

    new Setting(containerEl)
    .setName("Add dates as link?")
    .setDesc(
      "If enabled, dates created via autosuggest will be wrapped in [[wikilinks]]"
    )
    .addToggle((toggle) =>
      toggle
        .setValue(this.settings.autosuggestToggleLink)
        .onChange(async (value) => {
          this.settings.autosuggestToggleLink = value;
          await this.plugin.saveSettings();
        })
    );
  }

  /** generates the table of user-defined date formats */
  private displayUserFormats(containerEl:HTMLElement) {
    
    containerEl.createEl("h3", {
      text: "User formats",
    });

    new Setting(containerEl) 
      .setName('Create new format') 
      .setDesc('Click to create a new named format') 
      .addButton(button => { 
        button.setButtonText('Create') 
          .onClick(() => { 
            const newName = this.plugin.findUniqueFormatName("Untitled")
            const newIndex= this.settings.dateFormats.push({name: newName, locale: this.settings.locale})
            ;
          }); 
      });

      // Create a container for the table
    this.userFormatsContainer = containerEl.createEl('div', { cls: 'table-container' });
    this.generateUserFormatsTable(this.settings.dateFormats)
  }

  editDateFormat(index:number) {
    
    const modal = new SettingsDateFormatModal(this.plugin, this.settings.dateFormats[index - 1])
    modal.onClosed(() => this.updateUI()).open(); 
  }

  generateUserFormatsTable(formats:UserDateFormat[]) { 
    // delete is not only possible if we have more than one format
    const canDelete = formats.length > 1;
    // Clear the existing table
    this.userFormatsContainer.empty();
    // Create a container for the radio buttons 
    const radioContainer = this.userFormatsContainer.createEl('div', { cls: 'radio-container' });
    // Create a new table
    const table = this.userFormatsContainer.createEl('table'); 
    const headerRow = table.createEl('tr'); 
    headerRow.createEl('th', { text: 'Default' }); 
    headerRow.createEl('th', { text: 'Name' }); 
    headerRow.createEl('th', { text: 'Locale' }); 
    headerRow.createEl('th', { text: 'Example' }); 
    headerRow.createEl('th', { text: 'Actions' }); 
    for (let i = 0; i < formats.length; ++i) {
      const f = formats[i]
      const index = i
      const row = table.createEl("tr");
      const checked = f.name == this.settings.selectedFormat
      const radioButton = row.createEl("td").createEl('input', {
        type: "radio",
        value: f.name,
        attr: {
          id: `def-${f.name}`,
          name: "date-format", // for single selection
          ...( f.name == this.settings.selectedFormat ? { checked: true} : {})
        }
      }).addEventListener("change", (ev) => {
        this.settings.selectedFormat = (ev.target as HTMLInputElement).value
        notifyMessage(`Current format is ${this.settings.selectedFormat}`)
        this.updateUI();
      })
      row.createEl("td").setText(f.name);
      row.createEl("td").setText(f.locale);
      let todayFormatted:string;
      try {
        todayFormatted = formatDateTimeWithIntl(f, f.locale);
      } catch (err) {
        todayFormatted = "Error ";
      }
      row.createEl("td").setText(todayFormatted);
      //row.createEl("td").setText("xxxxxxxxxxxxxxxxxxxx");
      const buttonCell = row.createEl("td");
      buttonCell.createEl("button", { text: "Edit"}).onClickEvent( x => {
        const modal = new SettingsDateFormatModal(this.plugin, this.settings.dateFormats[index])
        modal.onClosed(() => this.updateUI()).open(); 
        this.updateUI();
      })
      if (canDelete) {
        buttonCell.createEl("button", { text: "Delete"}).onClickEvent( x => {
          this.settings.dateFormats.splice(index, 1)
          this.updateUI();
        })
      }

    }
  }

  validateAndSaveSettingsSync() { this.plugin.validateAndSaveSettingsSync()}
  async validateAndSaveSettings() { this.plugin.validateAndSaveSettings()}

  updateUI() { 
    // save settings to lake sur UI reflects the validated settings
    
    this.validateAndSaveSettingsSync()
    // Regenerate the table with the new value 
    console.log("updateUserFormatsTable")
    this.generateUserFormatsTable(this.settings.dateFormats);
  }
}
