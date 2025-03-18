import { EditorRange, EditorSelection, MarkdownView, Notice } from "obsidian";
import { watch } from "./debug";

let gDevMode = false;

export function setDevMode(onOff:boolean) {
    gDevMode = onOff;
}

export function notifyMessage(msg:string) {
    new Notice(msg)
}

export function notifyWarning(msg:string) {
    new Notice(msg)
    .noticeEl.addClass("nld-notice-warning");
}

export function notifyError(msg:string) {
    new Notice(msg)
    .noticeEl.addClass("nld-notice-error");
}

export function debugNotif(...msg:any[]) {
    if (gDevMode) notifyMessage(msg.join(" "))
}

export function isEmptyRange(range:EditorRange):boolean {
    return range?.from.line == range?.to.line
        && range?.from.ch == range?.to.ch
}

export function isEmptySelection(range:EditorSelection):boolean {
    return range?.head.line == range?.anchor.line
        && range?.head.ch == range?.anchor.ch
}

/** return the currently selected language for Obdisian UI
 * 
 * Current implementation relies on window.localStorage, because no API 
 * is available
 * 
 * NOTE : when current language is english, getItem("language") returns null
 * 
 * When UI language is English, localStorage getItem() returns null by design
 *      // https://discord.com/channels/686053708261228577/840286264964022302/1227891416164995183
 */
export function getObsidianLanguage() {
    return watch("getObsidianLanguage", window.localStorage?.getItem('language') ?? "en")
}