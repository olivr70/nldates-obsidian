import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from "obsidian";

import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale';
import localeData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import { IDateSuggestion, NLDSuggestContext } from "../types";
import { debug, enterLeave, enterLeaveSilent, watch } from "../utils/debug"
import type InternationalDates from "../main";
import { getSuggestionMaker } from "../suggest/locale-suggester";
import { suggestionWithDefaults } from "./suggest-utils";
import { showSuggestModal } from "./suggest-modal";



dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)





/**
 * @see https://docs.obsidian.md/Reference/TypeScript+API/EditorSuggest
 */
export default class DateSuggest extends EditorSuggest<IDateSuggestion> {
  private plugin: InternationalDates;

  private _lastSuggestions:IDateSuggestion[]
  private _tabbedSuggestion:IDateSuggestion;

  constructor(app: App, plugin: InternationalDates) {
    super(app);
    this.app = app;
    this.plugin = plugin;

    // @ts-ignore
    this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
      // @ts-ignore
      this.suggestions.useSelectedItem(evt);
      return false;
    });
    // @ts-ignore
    this.scope.register(["Ctrl"], "Enter", (evt: KeyboardEvent) => {
      // @ts-ignore
      this.suggestions.useSelectedItem(evt);
      return false;
    });
    // @ts-ignore
    this.scope.register(["Alt"], "Enter", (evt: KeyboardEvent) => {
      // @ts-ignore
      this.suggestions.useSelectedItem(evt);
      return false;
    });
    // @ts-ignore
    this.scope.register(["Shift", "Alt"], "Enter", (evt: KeyboardEvent) => {
      // @ts-ignore
      this.suggestions.useSelectedItem(evt);
      return false;
    });
    this.scope.register([], "Tab", this.tabHandler);

    this.setInstructions([{ command: "Alt", purpose: "Insert date as link" }]);
    this.setInstructions([{ command: "Shift", purpose: "Show suggestion dialog" }]);
  }

  /** handle a tab while in the suggestion menu; Two possible situations
   * - first tab : user selected the date string, and wants to add flags
   * - next tabs : user wants to select current flag, and add a new one
   */
  private tabHandler = (evt: KeyboardEvent) => {
    return enterLeave("tabHandler", () => {
        // @ts-ignore : selectedItem is not officialy exposed in Obsidian API
      const selectedItemIndex = this.suggestions.selectedItem;
      const selectedItem = this._lastSuggestions[selectedItemIndex];
      debug("selectedItem", selectedItemIndex, selectedItem)
      debug("_tabbedSuggestion", this._tabbedSuggestion)

      this.validateSelectedItem(selectedItem)
      return false;
    })
  }

  private validateSelectedItem(selectedItem:IDateSuggestion) {
    const { editor, start, end } = this.context;
    let tabbedText = ""
    if (selectedItem.isFlag)  {
      const currentSuffix = this._tabbedSuggestion.suffix
      const newFlag = selectedItem.label;
      const newSuffix = currentSuffix ? `${currentSuffix};${newFlag}` : newFlag
      debug("currentSuffix=", currentSuffix)
      debug("newFlag=", newFlag)
      tabbedText = "@" + (this._tabbedSuggestion.text ?? this._tabbedSuggestion.label) + "@" + newSuffix + ";"
      this._tabbedSuggestion.suffix = newSuffix
    } else {
      tabbedText = "@" + selectedItem.label + "@"
      this._tabbedSuggestion = selectedItem;
      this._tabbedSuggestion.suffix = ""
    }
    editor.replaceRange(tabbedText, start, end);
    const newPosition: EditorPosition = { line: start.line, ch: start.ch + tabbedText.length };
    editor.setCursor(newPosition)
  }

  /**
   * 
   * @override
   * @returns 
   */
  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    file: TFile
  ): EditorSuggestTriggerInfo {
    return enterLeaveSilent("onTrigger", () => {
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
    })
  }

  /** @override */
  getSuggestions(context: EditorSuggestContext): IDateSuggestion[] {
    return enterLeave("--- getSuggestions ---", () => {
      const suggestions = this.getDateSuggestions(context);
      if (suggestions && suggestions.length) {
        // preserve to handle Tab selection
        this._lastSuggestions = suggestions;
        console.log("DateSuggest.getSuggestions() = ", suggestions)
        return suggestions;
      } else {
        // catch-all if there are no matches
        this._lastSuggestions = [{ label: context.query }];;
      }

      return this._lastSuggestions
    })
  }

  /** @override */
  renderSuggestion(suggestion: IDateSuggestion, el: HTMLElement): void {
    return enterLeave("--- renderSuggestion ---", () => {
      const items = this.plugin.suggestionToMarkdown(suggestionWithDefaults(suggestion, this.plugin))
      const newMarkdown = this.plugin.generateMarkdownToInsert(items, false, false, false)
      const hintString = suggestion.hint ? ` (${suggestion.hint})` : ""
      
      el.setText(suggestion.label + hintString + " - " + newMarkdown);
    })
  }


  /** @override */
  selectSuggestion(suggestion: IDateSuggestion, event: KeyboardEvent | MouseEvent): void {
    // get context info before showing the modal dialog
    return enterLeave("--- selectSuggestion ---", () => {
      const { editor } = this.context;
      const { start, end } = this.context;
      const items = this.plugin.suggestionToMarkdown(suggestionWithDefaults(suggestion, this.plugin))
      if (event.shiftKey) {
        // use the selected suggestion text
        const finalSuggestion = {...suggestion, text: suggestion.label, value:items.dateValue }
        const modal = showSuggestModal(finalSuggestion, this.plugin);
        modal.onInsertWanted((m) => {
          editor.replaceRange(m.markdown, start, end);
          const newPosition: EditorPosition = { line: start.line, ch: start.ch + m.markdown.length };
          editor.setCursor(newPosition)
        })


      } else {
        
        const newText = this.plugin.generateMarkdownToInsert(items, event.ctrlKey, event.altKey, event.shiftKey)
        
        editor.replaceRange(newText, start, end);
      }
      this.clearLastSuggestions()
      
    })
  }

  private clearLastSuggestions() {

    this._lastSuggestions = undefined;
    this._tabbedSuggestion = undefined;
  }

  private getDateSuggestions(context: EditorSuggestContext): IDateSuggestion[] {
    return enterLeave("getDateSuggestions", () => {
      debug("tabbedSuggestion" , this._tabbedSuggestion)
      const nldContext:NLDSuggestContext = { plugin:this.plugin, ...context, last:this._tabbedSuggestion }
      return getSuggestionMaker(this.plugin.settings.locale).getDateSuggestions(nldContext);
    })
  }
}
