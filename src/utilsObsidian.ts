
import { Moment } from "moment";
import { App, Editor, EditorRange, EditorPosition, normalizePath, TFile } from "obsidian";
import { createDailyNote, getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";


/** return the word at **position** or the current position in **editor** if not specified */
export default function getWordBoundaries(editor: Editor, position?:EditorPosition): EditorRange {
  if (!editor) return undefined;
  const cursor = position || editor.getCursor();
  return editor.wordAt(position)
}

const REG_SPACE = /\s/

/** return the range of text around position, between occurences of **sep**
 * 
 * This is wider than {@link getWordBoundaries}, which stops on any non letter. which does
 * not work for dates, who often contain punctuation
*/
export function getBetweenRegexp(editor: Editor, sep: RegExp, position?:EditorPosition): EditorRange {
  const cursor = position || editor.getCursor();
  const line = editor.getLine(cursor.line)
  console.log("line",cursor.line, " = ",line)
  let begin = cursor.ch
  let end = cursor.ch
  while (begin > 0 && !sep.test(line[begin - 1])) { console.log(begin, "<", line[begin - 1], ">"); begin--}
  while (end < line.length && !sep.test(line[end])) { end++}
  return {
    from: { line: position.line, ch: begin},
    to: { line: position.line, ch: end}
  }
}

export function getWordBoundariesOld(editor: Editor, position?:EditorPosition): EditorRange {
    const cursor = position || editor.getCursor();
      const pos = editor.posToOffset(cursor);
      const word = (editor as any).cm.state.wordAt(pos);
      const wordStart = editor.offsetToPos(word.from);
      const wordEnd = editor.offsetToPos(word.to);
      return {
        from: wordStart,
        to: wordEnd,
      };
  }
  
  export function getSelectedText(editor: Editor): string {
    if (editor.somethingSelected()) {
      return editor.getSelection();
    } else {
      const wordBoundaries = getWordBoundaries(editor);
      editor.setSelection(wordBoundaries.from, wordBoundaries.to); // TODO check if this needs to be updated/improved
      return editor.getSelection();
    }
  }
  
  export function adjustCursor(
    editor: Editor,
    cursor: EditorPosition,
    newStr: string,
    oldStr: string
  ): void {
    const cursorOffset = newStr.length - oldStr.length;
    editor.setCursor({
      line: cursor.line,
      ch: cursor.ch + cursorOffset,
    });
  }
  
/** generate a Markdown link using an alias if set */
export function generateMarkdownLink(app: App, subpath: string, linkAlias?: string):string {
    const useMarkdownLinks = (app.vault as any).getConfig("useMarkdownLinks");
    const path = normalizePath(subpath);
  
    if (useMarkdownLinks) {
      if (linkAlias) {
        return `[${linkAlias}](${path.replace(/ /g, "%20")})`;
      } else {
        return `[${subpath}](${path})`;
      }
    } else {
      if (linkAlias) {
        return `[[${path}|${linkAlias}]]`;
      } else {
        return `[[${path}]]`;
      }
    }
  }
  
  export async function getOrCreateDailyNote(date: Moment): Promise<TFile | null> {
    // Borrowed from the Slated plugin:
    // https://github.com/tgrosinger/slated-obsidian/blob/main/src/vault.ts#L17
    const desiredNote = getDailyNote(date, getAllDailyNotes());
    if (desiredNote) {
      return Promise.resolve(desiredNote);
    }
    return createDailyNote(date);
  }
  