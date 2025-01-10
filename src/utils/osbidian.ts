import { EditorRange, EditorSelection, Notice } from "obsidian";

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