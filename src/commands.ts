import { EditorChange, EditorSelection, MarkdownView } from "obsidian";
import getWordBoundaries, { adjustCursor, getSelectedText } from "./utilsObsidian";
import NaturalLanguageDates from "./main";

export function getParseCommand(plugin: NaturalLanguageDates, mode: string): void {
  const { workspace } = plugin.app;
  const activeView = workspace.getActiveViewOfType(MarkdownView);

  // The active view might not be a markdown view
  if (!activeView) {
    return;
  }

  let firstError:EditorSelection = undefined;

  const editor = activeView.editor;
  
  const changes: EditorChange[] = [];

  for (let sel of editor.listSelections()) {
    if (sel.anchor.line == sel.head.line && sel.anchor.ch == sel.head.ch) {
      // empty selection, get word boundaries
      const word = getWordBoundaries(editor, sel.anchor)
      sel = { anchor: word.from, head:word.to}
    }
    const anchor = sel.anchor;
    const head = sel.head
    const selectedText = editor.getRange(anchor, head)
    const cursor = editor.getCursor();

    const date = plugin.parseDate(selectedText);

    if (!date.moment.isValid()) {
      if (!firstError) firstError = sel;
      continue; // error, iterate on next selection
    }

    // generate replacement text
    let newStr = `[[${date.formattedString}]]`;

    if (mode == "link") {
      newStr = `[${selectedText}](${date.formattedString})`;
    } else if (mode == "clean") {
      newStr = `${date.formattedString}`;
    } else if (mode == "time") {
      const time = plugin.parseTime(selectedText);

      newStr = `${time.formattedString}`;
    }
    // add a new change to the Editor transaction
    changes.push( { text:newStr, from:anchor, to:head })
    // editor.replaceRange(newStr, anchor, head);
  }
  // using transaction() allows for global undo of all changes if multiple selection
  editor.transaction({ changes })
  if (firstError) {
    // an error occured, select the problem
    editor.setSelection(firstError.anchor, firstError.head);
  }
  editor.focus();
}

export function insertMomentCommand(
  plugin: NaturalLanguageDates,
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

export function getNowCommand(plugin: NaturalLanguageDates): void {
  const format = `${plugin.settings.format}${plugin.settings.separator}${plugin.settings.timeFormat}`;
  const date = new Date();
  insertMomentCommand(plugin, date, format);
}

export function getCurrentDateCommand(plugin: NaturalLanguageDates): void {
  const format = plugin.settings.format;
  const date = new Date();
  insertMomentCommand(plugin, date, format);
}

export function getCurrentTimeCommand(plugin: NaturalLanguageDates): void {
  const format = plugin.settings.timeFormat;
  const date = new Date();
  insertMomentCommand(plugin, date, format);
}
