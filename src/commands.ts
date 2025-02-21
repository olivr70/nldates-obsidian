import { Editor, EditorChange, EditorPosition, EditorSelection, MarkdownView, Plugin } from "obsidian";
import getWordBoundaries, { adjustCursor, getBetweenRegexp, getSelectedText } from "./utilsObsidian";
import InternationalDates from "./main";
import { parseSuggestion, suggestionWithDefaults } from "./suggest/suggest-utils";
import { DateDisplay, IDateSuggestion, IInternationalDatesPlugin } from "./types";
import { debug, enterLeave } from "./utils/debug";
import { makeSingleLine } from "./utils/tools";
import { isEmptyRange, isEmptySelection, notifyWarning } from "./utils/osbidian";
import { showSuggestModal } from "./suggest/suggest-modal";


import { LLL } from "./i18n/localize";

export interface IParseArgs {
  mode: "replace" | "link" | "clean" | "time" | "user" | "locale" | "dialog";
  format?: string;
  locale?: string;
}

export function getParseCommand(plugin: IInternationalDatesPlugin, args: IParseArgs): void {
  return enterLeave("getParseCommand", () => {
    // const { workspace } = plugin.app;
    // const activeView = workspace.getActiveViewOfType(MarkdownView);

    // // The active view might not be a markdown view
    // if (!activeView) {
    //   return;
    // }

    let firstError:EditorSelection = undefined;

    const editor = getActiveEditor(plugin)
    
    const changes: EditorChange[] = [];

    if (args.mode == "dialog") {
      // multiple selections not supported with dialog
      const [suggestion, firstSelection] = selectionToSuggestion(plugin, editor.listSelections()[0]) 
      debug("firstSelection=", firstSelection)
      const modal = showSuggestModal(suggestion, plugin);
      modal.onInsertWanted((m) => {
        editor.replaceRange(m.markdown, firstSelection.anchor, firstSelection.head);
        const newPosition: EditorPosition = { line: firstSelection.head.line, ch: firstSelection.head.ch + modal.markdown.length };
        
        // editor.transaction({ changes: [ {text:m.markdown, from:firstSelection.anchor, to:firstSelection.head }] })
        editor.setCursor(newPosition)
      })
    } else 

    for (let sel of editor.listSelections()) {
      debug("sel=", sel)
      const [suggestion, adjustedSel] = selectionToSuggestion(plugin, sel) 
      console.log(suggestion)
      if (suggestion.value == undefined || isNaN(suggestion.value.getDate())) {
        const [from,to] = sortPositions(adjustedSel.anchor,adjustedSel.head)
        const text = editor.getRange(from,to)
        notifyWarning(LLL.notifications.NOT_A_DATE({text}))
        continue;
      }
      debug("adjustedSel=", adjustedSel)
      const sugWithDefaults = suggestionWithDefaults(suggestion, plugin)
      console.log("suggestion=", suggestion)

      
     if (args.mode == "link") {
        suggestion.linkToDailyNotes = true;
      } else if (args.mode == "user") {
        suggestion.format = args.format;
      } else if (args.mode == "locale") {
        delete suggestion.format ;
        suggestion.locale = args.locale;
      } else if (args.mode == "clean") {
        suggestion.asLink = false;
        suggestion.linkToDailyNotes = false;
      } else if (args.mode == "time") {
        suggestion.asLink = false
        suggestion.display = DateDisplay.asTime
      }

      const markdownDate = plugin.suggestionToMarkdown(suggestionWithDefaults(suggestion, plugin))
      const text = plugin.generateMarkdownToInsert(markdownDate, false, false, false)

      // const date = plugin.parseDate(queryFlags.text);

      // add a new change to the Editor transaction
      const [anchor, head] = sortPositions(adjustedSel.anchor, adjustedSel.head);
      changes.push( { text, from:anchor, to:head })
      // editor.replaceRange(newStr, anchor, head);
    } // for
    // using transaction() allows for global undo of all changes if multiple selection
    editor.transaction({ changes })
    if (firstError) {
      // an error occured, select the problem
      editor.setSelection(firstError.anchor, firstError.head);
    }
    editor.focus();
  })
}

function getActiveEditor(plugin:Plugin):Editor {
  const { workspace } = plugin.app;
  const activeView = workspace.getActiveViewOfType(MarkdownView);

  // The active view might not be a markdown view
  return activeView?.editor;
}

/** extracts a DateSuggestion from the current selection
 * If selection is a single position, extends the selection to the current run of text (between
 * spaces or wrapping char like PARENTHESIS, BRACKET, DOUBLE QUOTES)
 * @return a tuple, with a DateSuggestion and the EditorSelection
 */
function selectionToSuggestion(plugin:IInternationalDatesPlugin, sel:EditorSelection):[IDateSuggestion, EditorSelection] {
  const editor = getActiveEditor(plugin)
  if (sel.anchor.line == sel.head.line && sel.anchor.ch == sel.head.ch) {
    // empty selection, get word boundaries
    const word = getBetweenRegexp(editor, /[\s()\[\]{}|"]/, sel.anchor)
    sel = { anchor: word.from, head:word.to}
  }
  if (isEmptySelection(sel)) {
    // ignore empty selection parts
    notifyWarning("International Dates : No text to convert")
    return [{ value: new Date()}, sel];
  }
  const [anchor, head] = sortPositions(sel.anchor, sel.head);
  const selectedText = makeSingleLine(editor.getRange(anchor, head))

  const suggestion = parseSuggestion(selectedText, plugin) 
  return [suggestion, sel];
}

export function insertMomentCommand(
  plugin: InternationalDates,
  date: Date,
  format: string
) {
  const { workspace } = plugin.app;
  const activeView = workspace.getActiveViewOfType(MarkdownView);

  if (activeView) {
    // The active view might not be a markdown view
    const editor = activeView.editor;
    editor.replaceSelection(plugin.getFormattedDate(date, format));
  }
}

export function getNowCommand(plugin: InternationalDates): void {
  const format = `${plugin.settings.selectedFormat}${plugin.settings.separator}${plugin.settings.timeFormat}`;
  const date = new Date();
  insertMomentCommand(plugin, date, format);
}

export function getCurrentDateCommand(plugin: InternationalDates): void {
  const format = plugin.settings.selectedFormat;
  const date = new Date();
  insertMomentCommand(plugin, date, format);
}

export function getCurrentTimeCommand(plugin: InternationalDates): void {
  const format = plugin.settings.timeFormat;
  const date = new Date();
  insertMomentCommand(plugin, date, format);
}

/** sorts 2 EditorPositions in order of apperance */
export function sortPositions(from:EditorPosition, to: EditorPosition) {
  if (from.line > to.line ) {
    return [to, from]
  }
  if (from.line == to.line && from.ch > to.ch) {
    return [to, from]
  }
  return [from, to]
}