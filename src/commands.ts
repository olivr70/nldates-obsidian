import { Editor, EditorChange, EditorPosition, EditorSelection, EditorSelectionOrCaret, MarkdownFileInfo, MarkdownView, Plugin } from "obsidian";
import getWordBoundaries, { adjustCursor, getBetweenRegexp, getSelectedText } from "./utilsObsidian";
import InternationalDates from "./main";
import { findSuggestionSuffixAt, parseSuggestion, REG_SUGGESTION_SUFFIX, suggestionWithDefaults } from "./suggest/suggest-utils";
import { DateDisplay, IDateSuggestion, IInternationalDatesPlugin, MarkdownDateParts } from "./types";
import { debug, enterLeave } from "./utils/debug";
import { makeSingleLine } from "./utils/tools";
import { isEmptyRange, isEmptySelection, notifyError, notifyWarning } from "./utils/osbidian";
import { showSuggestModal } from "./suggest/suggest-modal";


import { LLL } from "./i18n/localize";
import { filterOverlappingResults, getAllDatesAt, parseAllFromTextWithLocales } from "./parser";
import { linesToText } from "./utils/markdown";

export interface IParseArgs {
  mode: "select" | "replace" | "link" | "daily" | "clean" | "time" | "user" | "locale" | "dialog";
  format?: string;
  locale?: string;
  editor: Editor;
  context: MarkdownView | MarkdownFileInfo;
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
    } else if (args.mode == "select") {
      debug("select")
      const newSelect:EditorSelectionOrCaret[] = []
      for (let sel of editor.listSelections()) {
        debug("sel : ", sel)
        const [suggestion, adjustedSel] = selectionToSuggestion(plugin, sel) 
        newSelect.push({ anchor: sel.anchor, head: sel.head} )
      }
      
      debug("New selections : ", newSelect)
      editor.setSelections(newSelect, 0)
    } else {
      let suggestion:IDateSuggestion;
      let markdownDate: MarkdownDateParts;
      try {
        for (let sel of editor.listSelections()) {
          debug("sel=", sel)
          
          let adjustedSel:EditorSelection;
          [suggestion, adjustedSel] = selectionToSuggestion(plugin, sel) 
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
          } else if (args.mode == "daily") {
            suggestion.linkToDailyNotes = true;
            suggestion.useTextAsLinkAlias = true;
            suggestion.text = editor.getRange(adjustedSel.anchor,adjustedSel.head);
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
          try {
            markdownDate = plugin.suggestionToMarkdown(suggestionWithDefaults(suggestion, plugin))

          } catch (e) {
            notifyError(LLL.notifications.UNABLE_TO_FORMAT_DATE({ text:suggestion.text }))
            console.log(e)
            continue;
          }
          const text = plugin.generateMarkdownToInsert(markdownDate, false, false, false)

          // const date = plugin.parseDate(queryFlags.text);

          // add a new change to the Editor transaction
          const [anchor, head] = sortPositions(adjustedSel.anchor, adjustedSel.head);
          changes.push( { text, from:anchor, to:head })
          console.log(`Will insert ${text} at `, anchor, head)
          // editor.replaceRange(newStr, anchor, head);
        } // for
        // using transaction() allows for global undo of all changes if multiple selection
        editor.transaction({ changes })
        if (firstError) {
          // an error occured, select the problem
          editor.setSelection(firstError.anchor, firstError.head);
        }
      } catch (e) {
        notifyError(LLL.notifications.UNABLE_TO_PROCESS_SELECTION())
        console.log(e)
      }
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

function getEditorLines(editor:Editor) {
  let result:string[] = []
  for (let i = 0; i < editor.lineCount(); ++i) {
    result.push(editor.getLine(i))
  }
  return result;
}

/** extracts a DateSuggestion from the current selection
 * If selection is a single position, tries all parsers on the full line using {@link getAllDatesAt}
 * @return a tuple, with a DateSuggestion and the EditorSelection
 */
function selectionToSuggestion(plugin:IInternationalDatesPlugin, sel:EditorSelection):[IDateSuggestion, EditorSelection] {
  const editor = getActiveEditor(plugin)
  if (isEmptySelection(sel)) {
    // empty selection
    // first check if cursor in in date string
    const lineText = editor.getLine(sel.anchor.line)
    const allDatesInLine = parseAllFromTextWithLocales(lineText)
    const results = filterOverlappingResults(allDatesInLine, sel.anchor.ch)
    if (results.length != 0) {
      // use the first (whis is the first and longest)
      // let's check for a suffix
      //
      sel.anchor.ch = results[0].index
      sel.head.ch = results[0].index + results[0].text.length
    } else { // no date under cursor
      const suffixAtPos = findSuggestionSuffixAt(lineText, sel.anchor.ch)
      if (suffixAtPos != null) {
        console.log("found suffix", suffixAtPos[0])
        // cursor is in a date suffix, 
        // if there is an immediateiy preceeeding date, use it
        const dateBeforeSuffix = filterOverlappingResults(allDatesInLine, suffixAtPos.index)
        if (dateBeforeSuffix.length != 0) {
          sel.anchor.ch = dateBeforeSuffix[0].index
          sel.head.ch = suffixAtPos.index + suffixAtPos[0].length
        }
      }
      if (isEmptySelection(sel)) {
        // no date has been detected under cursor. Use current word
        const word = getBetweenRegexp(editor, /[\s()\[\]{}|"]/, sel.anchor)
        sel = { anchor: word.from, head:word.to}
      }
    }
    // we know look for prefix and suffix indications from user
    const suffix = REG_SUGGESTION_SUFFIX.exec(lineText.substring(sel.head.ch))
    if (suffix?.index == 0) {
      // we have a valid suffix right after the selected text
      sel.head.ch = sel.head.ch + suffix[0].length
    }
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

/** insert a Moment date */
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