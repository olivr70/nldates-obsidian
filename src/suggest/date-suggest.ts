import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from "obsidian";

import { DateDisplay, IDateCompletion, NLDSuggestContext } from "src/types";
import type NaturalLanguageDates from "src/main";
import { generateMarkdownLink } from "src/utilsObsidian";
import { getSuggestionMaker } from "src/suggest/locale-suggester";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";


export default class DateSuggest extends EditorSuggest<IDateCompletion> {
  app: App;
  private plugin: NaturalLanguageDates;

  constructor(app: App, plugin: NaturalLanguageDates) {
    super(app);
    this.app = app;
    this.plugin = plugin;

    // @ts-ignore
    this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
      // @ts-ignore
      this.suggestions.useSelectedItem(evt);
      return false;
    });

    if (this.plugin.settings.autosuggestToggleLink) {
      this.setInstructions([{ command: "Shift", purpose: "Keep text as alias" }]);
    }
  }

  getSuggestions(context: EditorSuggestContext): IDateCompletion[] {
    const suggestions = this.getDateSuggestions(context);
    if (suggestions && suggestions.length) {
      return suggestions;
    }

    // catch-all if there are no matches
    return [{ label: context.query }];
  }

  getDateSuggestions(context: EditorSuggestContext): IDateCompletion[] {
    console.log("-------------------------------------------")
    const nldContext:NLDSuggestContext = { plugin:this.plugin, ...context}
    return getSuggestionMaker(this.plugin.settings.locale).getDateSuggestions(nldContext);
  }

  renderSuggestion(suggestion: IDateCompletion, el: HTMLElement): void {
    el.setText(suggestion.label);
  }

  selectSuggestion(suggestion: IDateCompletion, event: KeyboardEvent | MouseEvent): void {
    console.log("+++++++++++++++++++++++++++++++++++++++++++")
    const { editor } = this.context;

    console.log(`selectSuggestion()`)
    console.log(suggestion);

    // use the date provided by the suggester if set
    const dateSuggestion:string|Date = suggestion.value !== undefined ? suggestion.value : suggestion.label;
    let dateValue:Date = suggestion.value instanceof Date ? suggestion.value : undefined;

    const includeAlias = event.shiftKey;
    let dateStr = "";
    let timeStr = "";
    let makeIntoLink = this.plugin.settings.autosuggestToggleLink;

    

    if (dateSuggestion instanceof Date) {
      dateValue = dateSuggestion
      switch(suggestion.display) {
        case DateDisplay.asTime:
          timeStr = this.plugin.getFormattedDate(dateSuggestion, this.plugin.settings.timeFormat);
          break;
        case DateDisplay.asTimestamp:
          dateStr = this.plugin.getFormattedDate(dateSuggestion, this.plugin.settings.format);
          timeStr = this.plugin.getFormattedDate(dateSuggestion, this.plugin.settings.timeFormat);
          break;
        case DateDisplay.asDate:
          dateStr = this.plugin.getFormattedDate(dateSuggestion, this.plugin.settings.format);
          break;
        default:  // SAME AS asDate
          dateStr = this.plugin.getFormattedDate(dateSuggestion, this.plugin.settings.format);
          break;
      }
    } else {  // value was a string, or we are directly using the suggestion label
      let display = suggestion.display || DateDisplay.asDate;
      if (dateSuggestion.startsWith("time:")) {
        const timePart = dateSuggestion.substring(5);
        const timeValue = this.plugin.parseTime(timePart);
        dateValue = timeValue.date;
        dateStr = this.plugin.parseTime(timePart).formattedString;
        display = DateDisplay.asTime;
        makeIntoLink = false;
      } else {
        const parseResult = this.plugin.parseDate(dateSuggestion);
        dateValue = parseResult.date;
        dateStr = parseResult.moment.format(this.plugin.settings.format);
        timeStr = parseResult.moment.format(this.plugin.settings.timeFormat)
      }

      switch (display) {
        case DateDisplay.asTime:
          dateStr = timeStr;
          break;
        case DateDisplay.asTimestamp:
          dateStr = `${dateStr}${this.plugin.settings.separator}${timeStr}`;
          break;
        case DateDisplay.asDate:
            // NOTHING MORE
          break;
        default:
            // NOTHING MORE
      }
    }
    console.log(`makeIntoLink ${makeIntoLink}`)
    console.log(`dateStr ${dateStr}`)
    console.log(`suggestion ${suggestion}`)
    if (makeIntoLink) {
      if (this.plugin.settings.linkToDailyNotes) {
        const dailyNoteName = this.plugin.getFormattedDate(dateValue,getDailyNoteSettings().format);
        console.log( "linkToDailyNote\n", dailyNoteName,"\n", `suggestion.alias=${suggestion.alias}`)
        dateStr = generateMarkdownLink(
          this.app,
          dailyNoteName,
          includeAlias ? (suggestion.alias ? suggestion.alias : dateStr) : undefined
        );
      } else {
        dateStr = generateMarkdownLink(
          this.app,
          dateStr,
          includeAlias ? (suggestion.alias ? suggestion.alias : suggestion.label) : undefined
        );
      }
    }

    editor.replaceRange(dateStr, this.context.start, this.context.end);
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    file: TFile
  ): EditorSuggestTriggerInfo {
    if (!this.plugin.settings.isAutosuggestEnabled) {
      return null;
    }

    const triggerPhrase = this.plugin.settings.autocompleteTriggerPhrase;
    const startPos = this.context?.start || {
      line: cursor.line,
      ch: cursor.ch - triggerPhrase.length,
    };

    if (!editor.getRange(startPos, cursor).startsWith(triggerPhrase)) {
      return null;
    }

    const precedingChar = editor.getRange(
      {
        line: startPos.line,
        ch: startPos.ch - 1,
      },
      startPos
    );

    // Short-circuit if `@` as a part of a word (e.g. part of an email address)
    if (precedingChar && /[`a-zA-Z0-9]/.test(precedingChar)) {
      return null;
    }

    return {
      start: startPos,
      end: cursor,
      query: editor.getRange(startPos, cursor).substring(triggerPhrase.length),
    };
  }
}
