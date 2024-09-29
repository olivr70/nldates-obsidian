
import { Moment } from "moment";
import { App, Editor, EditorRange, EditorPosition, normalizePath, TFile } from "obsidian";
import { createDailyNote, getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";


export default function getWordBoundaries(editor: Editor, position?:EditorPosition): EditorRange {
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
  
  
export function generateMarkdownLink(app: App, subpath: string, alias?: string):string {
    const useMarkdownLinks = (app.vault as any).getConfig("useMarkdownLinks");
    const path = normalizePath(subpath);
  
    if (useMarkdownLinks) {
      if (alias) {
        return `[${alias}](${path.replace(/ /g, "%20")})`;
      } else {
        return `[${subpath}](${path})`;
      }
    } else {
      if (alias) {
        return `[[${path}|${alias}]]`;
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
  